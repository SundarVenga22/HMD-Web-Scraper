import pandas as pd
from math import ceil

def splitArr(lst, n):
  size = ceil(len(lst) / n)
  return list(
    map(lambda x: lst[x * size:x * size + size],
    list(range(n)))
  )

raw_data = open("VR_info.txt", "r")
raw_data_list = raw_data.readlines()

df = pd.DataFrame(splitArr(raw_data_list, 239), columns = ['Name', 'AR/VR', 'Standalone', 'Release Date', 'Retail Price ($ USD)', 'Display Type', 'Visible FoV', 'Resolution (pixels)', 'Refresh Rate (Hz)', 'IPD Range', 'Base Stations'])

df['Visible FoV'] = df['Visible FoV'].str.replace('Â', '')
df['Visible FoV'] = df['Visible FoV'].str.replace('horizontal', 'horizontal ')
df['Visible FoV'] = df['Visible FoV'].str.replace('vertical', 'vertical ')
df['Retail Price ($ USD)'] = df['Retail Price ($ USD)'].str.replace('$', '')
df['Refresh Rate (Hz)'] = df['Refresh Rate (Hz)'].str.replace('Hz', '')

writer = pd.ExcelWriter("VR_Output.xlsx", engine = "xlsxwriter")
df.to_excel(writer, sheet_name="VR Headsets")

workbook = writer.book
worksheet = writer.sheets["VR Headsets"]
worksheet.set_column(1, 12, 30)

writer.close()