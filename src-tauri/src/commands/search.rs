use std::fs;
use std::path::{Path, PathBuf};

use crate::fs_util::{is_markdown, should_skip_dir_name};
use crate::models::{SearchMatch, SearchResult};

/// Search all markdown files under `root` for `query` and return matching
/// lines grouped by file. Case-insensitive. Bounded to keep the UI snappy.
#[tauri::command]
pub fn search_dir(root: String, query: String) -> Result<Vec<SearchResult>, String> {
    let query = query.trim();
    if query.is_empty() {
        return Ok(Vec::new());
    }
    let root_path = PathBuf::from(&root);
    if !root_path.is_dir() {
        return Err(format!("{root} 不是有效的文件夹"));
    }

    let needle = query.to_lowercase();
    let mut files: Vec<PathBuf> = Vec::new();
    collect_markdown(&root_path, &mut files);

    const MAX_FILES: usize = 500;
    const MAX_MATCHES_PER_FILE: usize = 50;
    const MAX_LINE_LEN: usize = 240;

    let mut results: Vec<SearchResult> = Vec::new();
    for file in files.iter().take(MAX_FILES) {
        let content = match fs::read_to_string(file) {
            Ok(c) => c,
            Err(_) => continue,
        };
        let mut matches: Vec<SearchMatch> = Vec::new();
        for (i, line) in content.lines().enumerate() {
            if line.to_lowercase().contains(&needle) {
                let mut text = line.trim().to_string();
                if text.len() > MAX_LINE_LEN {
                    text.truncate(MAX_LINE_LEN);
                    text.push('…');
                }
                matches.push(SearchMatch {
                    line: i + 1,
                    text,
                });
                if matches.len() >= MAX_MATCHES_PER_FILE {
                    break;
                }
            }
        }
        if !matches.is_empty() {
            results.push(SearchResult {
                name: file
                    .file_name()
                    .map(|n| n.to_string_lossy().to_string())
                    .unwrap_or_default(),
                path: file.to_string_lossy().to_string(),
                matches,
            });
        }
    }

    Ok(results)
}

/// Recursively collect markdown file paths, skipping hidden/heavy dirs.
fn collect_markdown(dir: &Path, out: &mut Vec<PathBuf>) {
    let entries = match fs::read_dir(dir) {
        Ok(e) => e,
        Err(_) => return,
    };
    let mut entries: Vec<_> = entries.filter_map(|e| e.ok()).collect();
    entries.sort_by_key(|e| e.file_name());

    for entry in entries {
        let path = entry.path();
        let name = entry.file_name().to_string_lossy().to_string();
        if should_skip_dir_name(&name) {
            continue;
        }
        if path.is_dir() {
            collect_markdown(&path, out);
        } else if is_markdown(&path) {
            out.push(path);
        }
    }
}
