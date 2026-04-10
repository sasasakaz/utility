import pandas as pd

def scan_numeric_columns(df, target_cols):
    """
    数値型にしたいカラムをスキャンし、数値以外の文字が混ざっていないかチェックするにゃん。
    """
    # 存在するカラム、かつまだobject型のものだけを抽出
    # 数値型に変換済みのカラムがtarget_colsに含まれていた場合に不要なチェックを回避するフィルタ
    check_cols = [c for c in target_cols if c in df.columns and df[c].dtype == 'object']

    if not check_cols:
        print("✅ 対象のカラムはすべて数値型になってるにゃん！")
        return

    print("--- 🔍 数値列のobject混入チェック ---")
    for col in check_cols:
        # 数値に変換を試みる（数値にできないエラーのぶんはNaNになる）
        converted = pd.to_numeric(df[col], errors='coerce')
        # もともとNaNではなく、数値変換によって新たにNaNになった値（＝混入物）を特定
        # 混入物が入っている行だけを抽出
        non_numeric_rows = df.loc[converted.isna() & df[col].notna(), col]
        
        if not non_numeric_rows.empty:
            total_count = len(df)
            counts = non_numeric_rows.value_counts()
            total_non_numeric = counts.sum()
            rate = (total_non_numeric / total_count) * 100
            
            print(f"⚠️ {col}")
            print(f"   ∟ 総数: {total_count:,} 件")
            print(f"   ∟ 数値以外のデータ: {total_non_numeric:,} 件 ({rate:.2f} %)")
            print(f"   ∟ 詳細: ")
            for val, cnt in counts.items():
                print(f"      - '{val}': {cnt:,} 件")
            print("-" * 35)
        else:            
            print(f"✅ {col} -> すべて数値に変換可能だにゃん！")
