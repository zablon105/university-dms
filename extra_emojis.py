import re

extra_emoji_map = {
    '🚨': 'MdWarning',
    '👁️': 'MdVisibility',
    '👁': 'MdVisibility',
    '🎭': 'MdTheaterComedy',
    '🔄': 'MdLoop',
    '🏫': 'MdSchool',
    '🏠': 'MdHome',
    '📈': 'MdTrendingUp',
    '🔬': 'MdScience',
    '📐': 'MdSquareFoot',
    '⏳': 'MdHourglassEmpty',
}

import os
files = []
for r, d, f in os.walk("frontend/src"):
    for file in f:
        if file.endswith(".jsx"):
            files.append(os.path.join(r, file))

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    used_icons = set()
    original = content
    
    # 1. Exact quoted single emojis
    for emoji, icon in extra_emoji_map.items():
        pattern = r"['\"]" + re.escape(emoji) + r"['\"]"
        def exact_quote_repl(m):
            used_icons.add(m.group(0)) # wait need icon 
            pass # dirty hack to use non-local icon
        # better:
        content = re.sub(pattern, f"<{icon} />", content)
        if f"<{icon} />" in content and emoji in original:
            used_icons.add(icon)

    # 2. String literal repl
    def string_literal_repl(m):
        inner = m.group(2)
        res = inner
        has_emoji = False
        for e in extra_emoji_map.keys():
            if e in inner:
                has_emoji = True
                break
        if not has_emoji:
            return m.group(0)
        
        for e, icon in extra_emoji_map.items():
            if e in res:
                res = res.replace(e, f"<{icon} />")
                used_icons.add(icon)
        return f"<>{res}</>"
    
    content = re.sub(r"(['\"])(.*?)\1", string_literal_repl, content)
    
    # 3. Raw text
    for emoji, icon in extra_emoji_map.items():
        if emoji in content:
            content = content.replace(emoji, f"<{icon} />")
            used_icons.add(icon)
            
    if used_icons:
        if "from 'react-icons/md'" in content:
            def import_repl(m):
                existing = m.group(1).replace(" ", "").split(",")
                existing_set = set(e for e in existing if e)
                existing_set.update(used_icons)
                return "import { " + ", ".join(existing_set) + " } from 'react-icons/md'"
            
            content = re.sub(r"import\s+\{([^}]+)\}\s+from\s+['\"]react-icons/md['\"]", import_repl, content)
        else:
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
        print(f"Updated extra {file} - used {len(used_icons)} icons: {used_icons}")

