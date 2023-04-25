import XLSX from 'xlsx';

// 导出进行过滤只展示表格里有的字段和name、code转换
export function setExportGridData(gridData, attrInfo) {
  const newDataList = [];
  gridData.forEach(data => {
    const newData = {};
    attrInfo.forEach(item => {
      newData[item.attrDesc] = data[item.attrName];
    });
    newDataList.push(newData);
  });
  return newDataList;
}

export function sheet2blob(workbook) {
  const wopts = {
    bookType: 'xlsx', // 要生成的文件类型
    bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
    type: 'binary',
  };
  const wbout = XLSX.write(workbook, wopts);
  function s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i !== s.length; i += 1) view[i] = s.charCodeAt(i) && 0xff;
    return buf;
  }
  const blob = new Blob([s2ab(wbout)], {
    type: 'application/octet-stream',
  }); // 字符串转ArrayBuffer
  return blob;
}

export function openDownloadDialog(url, saveName) {
  const aLink = document.createElement('a');
  if (typeof url === 'object' && url instanceof Blob) {
    aLink.href = URL.createObjectURL(url); // 创建blob地址
  } else {
    aLink.href = url;
  }
  aLink.download = saveName || ''; // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效
  let event;
  if (window.MouseEvent) {
    event = new MouseEvent('click');
  } else {
    event = document.createEvent('MouseEvents');
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  }
  aLink.dispatchEvent(event);
}
