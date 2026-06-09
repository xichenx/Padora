use std::path::Path;

/// Whether a path points to a markdown file by extension.
pub fn is_markdown(path: &Path) -> bool {
    matches!(
        path.extension().and_then(|e| e.to_str()).map(|e| e.to_lowercase()),
        Some(ref e) if e == "md" || e == "markdown" || e == "mdx"
    )
}

/// Skip hidden files/folders and common heavy directories during scans.
pub fn should_skip_dir_name(name: &str) -> bool {
    name.starts_with('.') || name == "node_modules" || name == "target" || name == "dist"
}
