const root = new URL('../../', import.meta.url).pathname;
const { artCases } = await import(root + 'tests/art-cases.mjs');
const { rows } = await artCases(root);
const byId = (id) => document.getElementById(id),
  pageSize = 84;
let page = 0,
  visible = [];
// Equality is about rendered pixels, so the same cached art isn't displayed four times for seasons it doesn't use.
const unique = new Set();
for (const row of rows) {
  row.family = row.id.split(':')[0];
  const image = row.canvas.toDataURL();
  row.renderKey = image;
  unique.add(image);
}
for (const family of [...new Set(rows.map((r) => r.family))].sort()) {
  const option = document.createElement('option');
  option.value = family;
  option.textContent = family;
  byId('family').append(option);
}
function filter() {
  const query = byId('search').value.toLowerCase(),
    family = byId('family').value,
    distinct = byId('unique').checked;
  const seen = new Set();
  visible = rows
    .filter(
      (r) => (!query || r.id.toLowerCase().includes(query)) && (!family || r.family === family),
    )
    .filter((r) => {
      if (!distinct) return true;
      if (seen.has(r.renderKey)) return false;
      seen.add(r.renderKey);
      return true;
    });
  page = 0;
  render();
}
function render() {
  const fragment = document.createDocumentFragment();
  for (const row of visible.slice(page * pageSize, (page + 1) * pageSize)) {
    const figure = document.createElement('figure'),
      frame = document.createElement('div'),
      canvas = document.createElement('canvas'),
      label = document.createElement('figcaption');
    const scale = Math.min(
      5,
      Math.floor(120 / row.canvas.width),
      Math.floor(100 / row.canvas.height),
    );
    canvas.width = row.canvas.width;
    canvas.height = row.canvas.height;
    canvas.style.width = canvas.width * scale + 'px';
    canvas.style.height = canvas.height * scale + 'px';
    canvas.getContext('2d').drawImage(row.canvas, 0, 0);
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', row.id);
    frame.className = 'sprite';
    frame.append(canvas);
    label.textContent = row.id + ' · ' + canvas.width + '×' + canvas.height;
    figure.append(frame, label);
    fragment.append(figure);
  }
  byId('grid').replaceChildren(fragment);
  byId('status').textContent =
    rows.length.toLocaleString() +
    ' tested variants · ' +
    unique.size.toLocaleString() +
    ' distinct renders · ' +
    visible.length.toLocaleString() +
    ' match';
  byId('page').textContent = visible.length
    ? 'Page ' + (page + 1) + ' of ' + Math.ceil(visible.length / pageSize)
    : 'No matches';
  byId('previous').disabled = page === 0;
  byId('next').disabled = (page + 1) * pageSize >= visible.length;
}
byId('search').addEventListener('input', filter);
byId('family').addEventListener('change', filter);
byId('unique').addEventListener('change', filter);
byId('previous').addEventListener('click', () => {
  page--;
  render();
  scrollTo({ top: 0 });
});
byId('next').addEventListener('click', () => {
  page++;
  render();
  scrollTo({ top: 0 });
});
filter();
