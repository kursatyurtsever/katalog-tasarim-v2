import re
import os

def restore():
    with open('repomix-output.xml', 'r', encoding='utf-8') as f:
        content = f.read()

    pattern = re.compile(r'<file path="([^"]+)">\n(.*?)\n</file>', re.DOTALL)

    count = 0
    for match in pattern.finditer(content):
        path = match.group(1)
        file_content = match.group(2)
        os.makedirs(os.path.dirname(path) or '.', exist_ok=True)
        with open(path, 'w', encoding='utf-8', newline='\n') as f:
            f.write(file_content)
        print(f"Restored: {path}")
        count += 1
    
    print(f"Total restored files: {count}")

if __name__ == '__main__':
    restore()
