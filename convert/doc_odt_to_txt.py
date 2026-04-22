import subprocess
from pathlib import Path
import sys

def batch_convert_in_current_dir():
    # 実行時のカレントディレクトリを取得
    target_dir = Path.cwd()
    
    # 対象とする拡張子
    extensions = {'.doc', '.odt'}
    
    # 実行確認
    print(f"--- 変換処理を開始します ---")
    print(f"対象フォルダ: {target_dir}")
    
    count = 0
    # カレントディレクトリ直下のファイルを走査
    for file_path in target_dir.iterdir():
        if file_path.is_file() and file_path.suffix.lower() in extensions:
            print(f"変換中... {file_path.name}")
            try:
                # textutilで変換実行
                subprocess.run(["textutil", "-convert", "txt", str(file_path)], check=True)
                count += 1
            except subprocess.CalledProcessError:
                print(f"× 失敗: {file_path.name}")

    print(f"--------------------------")
    if count > 0:
        print(f"完了！ {count} 個のファイルを変換しました。")
    else:
        print("対象となる .doc または .odt ファイルは見つかりませんでした。")

if __name__ == "__main__":
    batch_convert_in_current_dir()
