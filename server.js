const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const files = {
  sentences: path.join(dataDir, 'sentences.json'),
  jilan: path.join(dataDir, 'jilan.json'),
  anchors: path.join(dataDir, 'anchors.json'),
  letters: path.join(dataDir, 'letters.json')
};

Object.values(files).forEach(file => {
  if (!fs.existsSync(file)) fs.writeFileSync(file, '[]');
});

function readData(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch(e) { return []; }
}
function writeData(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// 每日一句
app.get('/api/sentence/:date', (req, res) => {
  const data = readData(files.sentences);
  const found = data.find(s => s.date === req.params.date);
  res.json(found ? found : { date: req.params.date, text: '' });
});
app.post('/api/sentence', (req, res) => {
  let data = readData(files.sentences);
  const idx = data.findIndex(s => s.date === req.body.date);
  if (idx >= 0) data[idx] = req.body;
  else data.push(req.body);
  writeData(files.sentences, data);
  res.json({ ok: true });
});

// 寄澜
app.get('/api/jilan', (req, res) => res.json(readData(files.jilan)));
app.post('/api/jilan', (req, res) => {
  const data = readData(files.jilan);
  data.push(req.body);
  writeData(files.jilan, data);
  res.json({ ok: true, id: data.length - 1 });
});

// 锚记
app.get('/api/anchors', (req, res) => res.json(readData(files.anchors)));
app.post('/api/anchors', (req, res) => {
  const data = readData(files.anchors);
  data.push(req.body);
  writeData(files.anchors, data);
  res.json({ ok: true, id: data.length - 1 });
});

// 信件
app.get('/api/letters', (req, res) => res.json(readData(files.letters)));
app.post('/api/letters', (req, res) => {
  const data = readData(files.letters);
  data.push(req.body);
  writeData(files.letters, data);
  res.json({ ok: true, id: data.length - 1 });
});
app.delete('/api/letters/:id', (req, res) => {
  let data = readData(files.letters);
  const id = parseInt(req.params.id);
  if (id >= 0 && id < data.length) {
    data.splice(id, 1);
    writeData(files.letters, data);
    res.json({ ok: true });
  } else {
    res.status(404).json({ error: '未找到' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌙 泊处服务器已启动，端口：${PORT}`);
});