export const downloadCSV = (
  headers: string[],
  data: (string | number)[],
  filename: string
) => {
  // 添加BOM以支持中文
  const BOM = '\uFEFF';

  // 将数据转换为CSV格式
  const csvContent = [
    headers.join(','),
    ...data.map((row) => row.join(',')),
  ].join('\n');

  // 创建Blob对象
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' });

  // 创建下载链接
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;

  // 触发下载
  document.body.appendChild(link);
  link.click();

  // 清理
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
