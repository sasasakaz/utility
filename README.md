# utility
## 1. 🔍 データ検査ツール (data checks)
`scan_numeric_columns`: 数値列の混入物をチェックします。
### 使い方
```python
!wget https://raw.githubusercontent.com/sasasakaz/utility/main/data_checks/data_inspection.py
import data_inspection
numeric_scanner.scan_numeric_columns(df, ['target_col'])
```

## 2. 🔍 データ変換ツール (convert)
`convert_doc_odt_to_txt`:  .docまたは.odtファイルをテキストファイルに変換します。  
`convert_pages_to_txt`:  .pagesファイルをテキストファイルに変換します。
### 使い方
変換したいファイルが格納されているディレクトリに移動してから、
```python
python convert_doc_odt_to_txt.py
python convert_pages_to_txt.py
```
