import os
import re

emoji_map = {
    '☁️': 'MdCloud',
    '📋': 'MdAssignment',
    '✅': 'MdCheckCircle',
    '📄': 'MdDescription',
    '🕐': 'MdAccessTime',
    '��': 'MdSchool',
    '📊': 'MdInsertChart',
    '🔍': 'MdSearch',
    '📝': 'MdEditDocument',
    '📁': 'MdFolder',
    '📂': 'MdFolderOpen',
    '📥': 'MdDownload',
    '🎓': 'MdSchool',
    '🏅': 'MdStars',
    '👋': 'MdWavingHand',
    '🤝': 'MdHandshake',
    '📅': 'MdCalendarToday',
    '⚡': 'MdBolt',
    '💬': 'MdChat',
    '📤': 'MdUpload',
    '🗄️': 'MdStorage',
    '💽': 'MdSave',
    '🛡️': 'MdShield',
    '👥': 'MdPeople',
    '⚠️': 'MdWarning',
    '➕': 'MdAdd',
    '⬇️': 'MdFileDownload',
    '🔐': 'MdLock',
    '🧭': 'MdExplore',
    '💾': 'MdSave',
    '❌': 'MdCancel',
    'ℹ️': 'MdInfo',
    '⚠': 'MdWarning',
    '✗': 'MdClose',
    '✓': 'MdCheck',
    '✔️': 'MdCheck',
    '��': 'MdLock',
    'ℹ': 'MdInfo',
}

files = set()
if os.path.exists('emojis.txt'):
    with open('emojis.txt', 'r') as f:
        for line in f:
            path = line.split(':')[0]
            if os.path.exists(path):
                files.add(path)

print(f"Files to process: {len(files)}")

for file in files:
    with open(file, 'r') as f:
        content = f.read()
        
    original = content
    used_icons = set()
    
    # 1. First deal with exact quoted single emojis: '📄' or "📄" -> <MdDescription />
    # Also handles cases like { icon: '📄' } -> { icon: <MdDescription /> }
    for emoji, icon in emoji_map.items():
        pattern = r"['\"]" + re.escape(emoji) + r"['\"]"
        def exact_quote_repl(m):
            used_icons.add(icon)
            return f"<{icon} />"
        content = re.sub(pattern, exact_quote_repl, content)

    # 2. Deal with template literals containing emojis e.g. `${someVar} 📄`
    # We shouldn't turn them into components, but wait, template literals are strings...
    # Honestly, we can just replace emojis everywhere else with <Icon /> directly.
    # If they are inside plain JSX text they will render fine.
    # If they are inside strings (like '📄 Missing Signatures'), we can replace them 
    # but we ALSO need to strip quotes if it's assigned to a prop or variable that expects a ReactNode.
    # A safe heuristic:
    # If we find an emoji inside a string literal that contains BOTH text and emoji,
    # let's replace the string literal format `'text ' + Emoji` with `<>text <Icon /></>`.
    
    # Let's find all string literals:
    def string_literal_repl(m):
        quote = m.group(1)
        inner = m.group(2)
        has_emoji = False
        for e in emoji_map:
            if e in inner:
                has_emoji = True
                break
        if not has_emoji:
            return m.group(0)
            
        # If it has emoji, replace inside:
        res = inner
        for e, icon in emoji_map.items():
            if e in res:
                res = res.replace(e, f"<{icon} />")
                used_icons.add(icon)
                
        # Now drop the quotes and wrap in fragment:
        return f"<>{res}</>"
        
    # Matches '...' or "..." (not backticks)
    content = re.sub(r"(['\"])(.*?)\1", string_literal_repl, content)

    # 3. Replace any remaining emojis in raw text (JSX text)
    for emoji, icon in emoji_map.items():
        if emoji in content:
            content = content.replace(emoji, f"<{icon} />")
            used_icons.add(icon)
            
    if used_icons:
        # Check if react-icons is imported
        import_stmt = "from 'react-icons/md'"
        if import_stmt in content:
            # Need to append to existing import? This is tricky.
            # Easier fallback: find existing import { ... } from 'react-icons/md' and extend it.
            def import_repl(m):
                existing = m.group(1).replace(" ", "").split(",")
                existing_set = set(e for e in existing if e)
                existing_set.update(used_icons)
                return "import { " + ", ".join(existing_set) + " } from 'react-icons/md'"
            
            content = re.sub(r"import\s+\{([^}]+)\}\s+from\s+['\"]react-icons/md['\"]", import_repl, content)
            
            # If the pattern didn't match (e.g. multi-line import), we can just inject a new one.
            # But duplicate imports cause warnings. We will trust the regex for single line.
            if "import {" not in re.sub(r"import\s+\{([^}]+)\}\s+from\s+['\"]react-icons/md['\"]", "", original) and not set(used_icons).issubset(set(re.findall(r"Md[A-Za-z]+", original))):
                # If regex fails to catch it because of newlines
                pass
        else:
            # Add to top
            # Insert after the last import statement, or at the top
            idx = content.find("import ")
            if idx == -1: idx = 0
            lines = content.split('\n')
            last_import = 0
            for i, l in enumerate(lines):
                if l.startswith("import "): last_import = i
            
            new_import = "import { " + ", ".join(used_icons) + " } from 'react-icons/md';"
            lines.insert(last_import + 1, new_import)
            content = '\n'.join(lines)
            
        with open(file, 'w') as f:
            f.write(content)
        print(f"Updated {file} - used {len(used_icons)} icons")

