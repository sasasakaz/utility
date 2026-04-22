import subprocess
from pathlib import Path

def convert_pages_via_applescript(pages_path):
    pages_path = Path(pages_path).absolute()
    # 書き出し先のパス（.txt）
    txt_path = pages_path.with_suffix('.txt')
    
    # Pagesを操作して「標準テキスト」で書き出させるAppleScript
    # 1. Pagesでファイルを開く
    # 2. 指定のパスにexportする
    # 3. ファイルを閉じる
    script = f'''
    tell application "Pages"
        set myDoc to open (POSIX file "{pages_path}")
        export myDoc to (POSIX file "{txt_path}") as unformatted text
        close myDoc saving no
    end tell
    '''
    
    try:
        # AppleScriptを実行
        subprocess.run(['osascript', '-e', script], check=True, capture_output=True)
        return txt_path.exists()
    except subprocess.CalledProcessError as e:
        print(f"  × AppleScriptエラー: {e.stderr.decode('utf-8')}")
        return False

def main():
    target_dir = Path.cwd()
    print(f"--- AppleScriptによるPages変換 ---")
    
    count = 0
    for file_path in target_dir.iterdir():
        if file_path.suffix.lower() == '.pages' and not file_path.name.startswith('.'):
            print(f"Pagesを起動して処理中... {file_path.name}")
            if convert_pages_via_applescript(file_path):
                print(f"  -> 成功！")
                count += 1
            else:
                print(f"  × 失敗: Pagesアプリで開けないか、変換に失敗しました。")

    print(f"--------------------------")
    print(f"完了！ {count} 個を変換しました。")

if __name__ == "__main__":
    main()