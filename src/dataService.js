const DATA_CACHE = {};

export function loadCachedData(opener, file, callback) {
  if (DATA_CACHE[file]) return DATA_CACHE[file];
  opener(file, (data) => {
    DATA_CACHE[file] = data;
    callback(data);
  });
}
