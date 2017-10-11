const DATA_CACHE = {};

export function dataUrl(file) {
  return `data/${file}`;
}

export function loadCachedData(opener, file, callback) {
  if (DATA_CACHE[file]) return DATA_CACHE[file];
  opener(dataUrl(file), (data) => {
    DATA_CACHE[file] = data;
    callback(data);
  });
}
