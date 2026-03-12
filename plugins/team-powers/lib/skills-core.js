import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * Extract YAML frontmatter from a skill file.
 * Current format:
 * ---
 * name: skill-name
 * description: Use when [condition] - [what it does]
 * ---
 *
 * @param {string} filePath - Path to SKILL.md file
 * @returns {{name: string, description: string}}
 */
function extractFrontmatter(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');

        let inFrontmatter = false;
        let name = '';
        let description = '';

        for (const line of lines) {
            if (line.trim() === '---') {
                if (inFrontmatter) break;
                inFrontmatter = true;
                continue;
            }

            if (inFrontmatter) {
                const match = line.match(/^([\w-]+):\s*(.*)$/);
                if (match) {
                    const [, key, value] = match;
                    switch (key) {
                        case 'name':
                            name = value.trim().replace(/^["']|["']$/g, '');
                            break;
                        case 'description':
                            description = value.trim().replace(/^["']|["']$/g, '');
                            break;
                    }
                }
            }
        }

        if (!name && !description) {
            console.error(`[skills-core] No frontmatter found in ${filePath}`);
        }

        return { name, description };
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error(`[skills-core] File not found: ${filePath}`);
        } else if (error.code === 'EACCES') {
            console.error(`[skills-core] Permission denied: ${filePath}`);
        } else {
            console.error(`[skills-core] Error reading ${filePath}: ${error.message}`);
        }
        return { name: '', description: '' };
    }
}

// Cache for resolveSkillPath results
const _resolveCache = new Map();

/**
 * Find all SKILL.md files in a directory recursively.
 *
 * @param {string} dir - Directory to search
 * @param {string} sourceType - 'personal' or 'team-powers' for namespacing
 * @param {number} maxDepth - Maximum recursion depth (default: 3)
 * @returns {Array<{path: string, name: string, description: string, sourceType: string}>}
 */
function findSkillsInDir(dir, sourceType, maxDepth = 3) {
    const skills = [];

    if (!fs.existsSync(dir)) return skills;

    function recurse(currentDir, depth) {
        if (depth >= maxDepth) return;

        let entries;
        try {
            entries = fs.readdirSync(currentDir, { withFileTypes: true });
        } catch (error) {
            console.error(`[skills-core] Cannot read directory ${currentDir}: ${error.message}`);
            return;
        }

        for (const entry of entries) {
            if (!entry.isDirectory()) continue;

            const fullPath = path.join(currentDir, entry.name);

            // Check for SKILL.md in this directory
            const skillFile = path.join(fullPath, 'SKILL.md');
            if (fs.existsSync(skillFile)) {
                const { name, description } = extractFrontmatter(skillFile);
                skills.push({
                    path: fullPath,
                    skillFile: skillFile,
                    name: name || entry.name,
                    description: description || '',
                    sourceType: sourceType
                });
            }

            // Recurse into subdirectories
            recurse(fullPath, depth + 1);
        }
    }

    recurse(dir, 0);
    return skills;
}

/**
 * Resolve a skill name to its file path, handling shadowing
 * (personal skills override team-powers skills).
 * Results are cached for performance within the same process.
 *
 * @param {string} skillName - Name like "team-powers:brainstorming" or "my-skill"
 * @param {string} teamPowersDir - Path to team-powers skills directory
 * @param {string} personalDir - Path to personal skills directory
 * @returns {{skillFile: string, sourceType: string, skillPath: string} | null}
 */
function resolveSkillPath(skillName, teamPowersDir, personalDir) {
    const cacheKey = `${skillName}|${teamPowersDir}|${personalDir}`;
    if (_resolveCache.has(cacheKey)) {
        return _resolveCache.get(cacheKey);
    }

    // Strip team-powers: prefix if present
    const forceTeamPowers = skillName.startsWith('team-powers:');
    const actualSkillName = forceTeamPowers ? skillName.replace(/^team-powers:/, '') : skillName;

    let result = null;

    // Try personal skills first (unless explicitly team-powers:)
    if (!forceTeamPowers && personalDir) {
        const personalPath = path.join(personalDir, actualSkillName);
        const personalSkillFile = path.join(personalPath, 'SKILL.md');
        if (fs.existsSync(personalSkillFile)) {
            result = {
                skillFile: personalSkillFile,
                sourceType: 'personal',
                skillPath: actualSkillName
            };
        }
    }

    // Try team-powers skills
    if (!result && teamPowersDir) {
        const teamPowersPath = path.join(teamPowersDir, actualSkillName);
        const teamPowersSkillFile = path.join(teamPowersPath, 'SKILL.md');
        if (fs.existsSync(teamPowersSkillFile)) {
            result = {
                skillFile: teamPowersSkillFile,
                sourceType: 'team-powers',
                skillPath: actualSkillName
            };
        }
    }

    _resolveCache.set(cacheKey, result);
    return result;
}

/**
 * Clear the resolve cache. Useful when skills may have changed on disk.
 */
function clearResolveCache() {
    _resolveCache.clear();
}

/**
 * Check if a git repository has updates available.
 *
 * @param {string} repoDir - Path to git repository
 * @param {number} timeoutMs - Timeout for git operations in milliseconds (default: 5000)
 * @returns {boolean} - True if updates are available
 */
function checkForUpdates(repoDir, timeoutMs = 5000) {
    try {
        const output = execSync('git fetch origin && git status --porcelain=v1 --branch', {
            cwd: repoDir,
            timeout: timeoutMs,
            encoding: 'utf8',
            stdio: 'pipe'
        });

        // Parse git status output to see if we're behind
        const statusLines = output.split('\n');
        for (const line of statusLines) {
            if (line.startsWith('## ') && line.includes('[behind ')) {
                return true; // We're behind remote
            }
        }
        return false; // Up to date
    } catch (error) {
        // Network down, git error, timeout, etc. - don't block bootstrap
        return false;
    }
}

/**
 * Strip YAML frontmatter from skill content, returning just the content.
 *
 * @param {string} content - Full content including frontmatter
 * @returns {string} - Content without frontmatter
 */
function stripFrontmatter(content) {
    const lines = content.split('\n');
    let inFrontmatter = false;
    let frontmatterEnded = false;
    const contentLines = [];

    for (const line of lines) {
        if (line.trim() === '---') {
            if (inFrontmatter) {
                frontmatterEnded = true;
                continue;
            }
            inFrontmatter = true;
            continue;
        }

        if (frontmatterEnded || !inFrontmatter) {
            contentLines.push(line);
        }
    }

    return contentLines.join('\n').trim();
}

export {
    extractFrontmatter,
    findSkillsInDir,
    resolveSkillPath,
    clearResolveCache,
    checkForUpdates,
    stripFrontmatter
};
