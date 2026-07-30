const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const newFunc = `    function generateAcademicReportHTML(nama, nim, forPdf = false) {
      const ptStr = computedInput.plaintext || "        ";
      const keyStr = computedInput.key || "        ";
      const ptChars = Array.from(ptStr);
      const keyChars = Array.from(keyStr);
      const analisaText = document.getElementById('analisaMahasiswa') ? document.getElementById('analisaMahasiswa').value : "";

      const css = \`
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Times New Roman',Times,serif;font-size:11pt;color:#000;background:#fff;line-height:1.5}
.page{width:210mm;min-height:297mm;padding:15mm 20mm 15mm 20mm;background:#fff;position:relative;page-break-after:always;margin:0 auto}
.page:last-child{page-break-after:auto}
.pg-header,.pg-footer{position:absolute;left:20mm;right:20mm;font-family:Arial,sans-serif;font-size:9pt}
.pg-header{top:12mm;display:flex;justify-content:space-between;align-items:flex-start;font-weight:bold}
.pg-header-left{text-align:left;font-style:italic}
.pg-footer{bottom:12mm;text-align:left}
.pg-footer i{font-style:italic}
.content{margin-top:20mm;margin-bottom:15mm}
.cover-title{text-align:center;font-weight:bold;font-size:14pt;margin-bottom:25px;line-height:1.3}
.logo{width:140px;height:140px;display:block;margin:40px auto}
.cover-table{width:100%;border-collapse:collapse;margin-top:30px;font-size:12pt}
.cover-table td{border:1px solid #000;padding:8px 12px;vertical-align:top}
.cover-table td:first-child{width:35%}
.cover-bottom{text-align:center;font-weight:bold;font-size:12pt;position:absolute;bottom:30mm;left:0;right:0;line-height:1.4}
h3{font-size:11pt;font-weight:bold;margin:15px 0 5px}
.title-sec{text-align:center;font-size:14pt;font-weight:bold;margin-bottom:20px;line-height:1.3}
.sec-hdr{font-weight:bold;margin-top:15px;margin-bottom:10px}
.wk-table{border-collapse:collapse;margin-bottom:15px;text-align:center;width:100%;table-layout:fixed}
.wk-table th,.wk-table td{border:1px solid #000;padding:4px;font-family:Arial,sans-serif;font-size:10pt;height:26px}
.wk-table th{background:transparent;font-weight:normal}
.char-span{font-weight:bold;color:#0070c0}
.key-char-span{font-weight:bold;color:#00b050}
.xor-label{width:40px;text-align:left;border-right:1px solid #000;padding-left:8px;font-weight:bold}
.block-table-container{display:flex;flex-direction:column;gap:5px;margin-bottom:15px}
.block-table-container .wk-table{margin-bottom:0;width:auto;min-width:300px}
.sbox-row{margin-bottom:5px;font-family:'Times New Roman',Times,serif}
.sbox-indent{margin-left:20px;font-family:'Times New Roman',Times,serif;line-height:1.3}
.analysis-box{border:1px solid #000;width:100%;height:600px;margin-top:10px}
.print-btn{position:fixed;top:12px;right:12px;background:#1e3a5f;color:#fff;border:none;padding:10px 22px;border-radius:6px;font-size:13px;font-weight:bold;cursor:pointer;z-index:999}
.print-btn:hover{background:#2563eb}
@media print{.print-btn{display:none!important}}
      \`;

      function headerFooter(pageNum) {
        return \`
        <div class="pg-header">
          <div class="pg-header-left">
            <i>STIK3051 – Keamanan Informasi</i><br>
            <i>CBL-1: Penerapan dan Analisis Enkripsi dan Dekripsi Informasi menggunakan Algoritma DES</i>
          </div>
          <div>\${pageNum}</div>
        </div>
        <div class="pg-footer">
          <i>Program Studi Teknik Komputer - DTEK – FT – USK</i><br>
          <i>Copyright: yuliar@usk.ac.id</i>
        </div>\`;
      }

      function escHtml(s) { return String(s||'').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

      function makeAsciiTable(chars, isPt) {
        let colorCls = isPt ? 'char-span' : 'key-char-span';
        let html = \`<table class="wk-table" style="width:auto; min-width:300px;"><tr>\`;
        for (let i=1; i<=8; i++) html += \`<th>\${i}</th>\`;
        html += \`</tr><tr>\`;
        for (let i=0; i<8; i++) html += \`<td class="\${colorCls}">\${chars[i]||''}</td>\`;
        html += \`</tr></table>\`;
        return html;
      }

      function makeHexTable(chars, hexArr, isPt) {
        let colorCls = isPt ? 'char-span' : 'key-char-span';
        let html = \`<table class="wk-table"><tr>\`;
        for (let i=1; i<=16; i++) html += \`<th>\${i}</th>\`;
        html += \`</tr><tr>\`;
        for (let i=0; i<8; i++) html += \`<td colspan="2" class="\${colorCls}">\${chars[i]||''}</td>\`;
        html += \`</tr><tr>\`;
        for (let i=0; i<16; i++) html += \`<td>\${hexArr[i]||''}</td>\`;
        html += \`</tr></table>\`;
        return html;
      }

      function makeBitTable(startIdx, charArr, valuesArr, isPt) {
        let colorCls = isPt ? 'char-span' : 'key-char-span';
        let html = \`<table class="wk-table"><tr>\`;
        for (let i = startIdx; i < startIdx + 16; i++) html += \`<th>\${i}</th>\`;
        html += \`</tr><tr>\`;
        html += \`<td colspan="8" class="\${colorCls}">\${charArr[0]||''}</td>\`;
        html += \`<td colspan="8" class="\${colorCls}">\${charArr[1]||''}</td>\`;
        html += \`</tr><tr>\`;
        for (let i = 0; i < 16; i++) html += \`<td>\${valuesArr[i] !== undefined ? valuesArr[i] : ''}</td>\`;
        html += \`</tr></table>\`;
        return html;
      }

      function makeMultiBlockTable(indices, values, blockSize) {
        let html = \`<div class="block-table-container">\`;
        let numBlocks = Math.ceil(indices.length / blockSize);
        for (let b = 0; b < numBlocks; b++) {
          let chunkIndices = indices.slice(b * blockSize, (b + 1) * blockSize);
          let chunkValues = values.slice(b * blockSize, (b + 1) * blockSize);
          html += \`<table class="wk-table" style="width:auto; min-width:\${blockSize*25}px;"><tr>\`;
          for (let i of chunkIndices) html += \`<th style="width:25px">\${i}</th>\`;
          html += \`</tr><tr>\`;
          for (let v of chunkValues) html += \`<td>\${v !== undefined ? v : ''}</td>\`;
          html += \`</tr></table>\`;
        }
        html += \`</div>\`;
        return html;
      }

      function makeXorTableP(label, val1, val2, xorVal, l1, l2) {
        let html = \`<div style="margin-bottom:5px">\${label}</div><table class="wk-table" style="width:auto; min-width:400px; margin-left:20px;">\`;
        html += \`<tr><td class="xor-label">\${l1}</td>\`;
        for(let i=0; i<16; i++) html += \`<td>\${val1[i]!==undefined?val1[i]:''}</td>\`;
        html += \`</tr><tr><td class="xor-label">\${l2}</td>\`;
        for(let i=0; i<16; i++) html += \`<td>\${val2[i]!==undefined?val2[i]:''}</td>\`;
        html += \`</tr><tr><td class="xor-label">XOR</td>\`;
        for(let i=0; i<16; i++) html += \`<td>\${xorVal[i]!==undefined?xorVal[i]:''}</td>\`;
        html += \`</tr></table>\`;
        return html;
      }

      function makeHexTableCipher(hexStr) {
        const hexArr = (hexStr||'').replace(/\\s/g, '').split('');
        let html = \`<table class="wk-table"><tr>\`;
        for (let i=1; i<=16; i++) html += \`<th>\${i}</th>\`;
        html += \`</tr><tr>\`;
        for (let i=0; i<16; i++) html += \`<td>\${hexArr[i]||''}</td>\`;
        html += \`</tr></table>\`;
        return html;
      }

      // Generate NIM list 1. 2. 3. 4. 5.
      const nimLines = nim.split('\\n').filter(l=>l.trim().length>0);
      let nimHtml = '';
      for(let i=0; i<5; i++) {
        nimHtml += \`\${i+1}. \${i < nimLines.length ? escHtml(nimLines[i]) : ''}<br>\`;
      }

      // Arrays
      const inputKeyIndices = [];
      const inputKeyValues = [];
      for (let i = 0; i < 64; i++) {
        if ((i + 1) % 8 !== 0) {
          inputKeyIndices.push(i + 1);
          inputKeyValues.push(GT.keyBin ? GT.keyBin[i] : '');
        }
      }
      const pc1Indices = PC1_C.concat(PC1_D);
      const shifted_C_indices = PC1_C.slice(1).concat(PC1_C[0]);
      const shifted_D_indices = PC1_D.slice(1).concat(PC1_D[0]);

      // SBox output
      let sboxDetails = '';
      for (let s = 0; s < 8; s++) {
        const row = GT.sboxRowArr ? GT.sboxRowArr[s] : '';
        const col = GT.sboxColArr ? GT.sboxColArr[s] : '';
        const out = GT.sboxOutBits ? GT.sboxOutBits.slice(s * 4, s * 4 + 4).join('') : '';
        const nth = ['pertama','ke-dua','ke-tiga','ke-empat','ke-lima','ke-enam','ke-tujuh','ke-delapan'][s];
        sboxDetails += \`<div class="sbox-row">Bagian 6-bit yang \${nth} :<div class="sbox-indent">Indek baris &nbsp;&nbsp;&nbsp;&nbsp;: = \${row}<br>Indek kolom &nbsp;&nbsp;&nbsp;: = \${col}<br>4-bit Output S\${s+1} : = \${out}</div></div>\`;
      }
      
      const logoSVG = \`<svg class="logo" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <g fill="#D4A017" stroke="#8B6914" stroke-width="1.5">
          <ellipse cx="100" cy="44" rx="17" ry="38"/>
          <ellipse cx="100" cy="44" rx="17" ry="38" transform="rotate(72 100 100)"/>
          <ellipse cx="100" cy="44" rx="17" ry="38" transform="rotate(144 100 100)"/>
          <ellipse cx="100" cy="44" rx="17" ry="38" transform="rotate(216 100 100)"/>
          <ellipse cx="100" cy="44" rx="17" ry="38" transform="rotate(288 100 100)"/>
        </g>
        <circle cx="100" cy="100" r="33" fill="#D4A017" stroke="#8B6914" stroke-width="2"/>
        <rect x="94" y="82" width="12" height="28" fill="#8B6914" rx="1"/>
        <polygon points="100,70 89,82 111,82" fill="#8B6914"/>
        <rect x="96" y="100" width="8" height="7" fill="#D4A017"/>
        <rect x="88" y="110" width="24" height="4" fill="#8B6914" rx="1"/>
      </svg>\`;

      const contentHtml = \`
<!-- Halaman 1 -->
<div class="page">
  \${headerFooter(1)}
  <div class="content" style="margin-top: 40px">
    <div class="cover-title">
      STIK3051 – KEAMANAN INFORMASI<br><br>
      CBL-1<br><br>
      PENERAPAN DAN ANALISIS ENKRIPSI DAN DEKRIPSI INFORMASI<br>
      MENGGUNAKAN ALGORITMA DES
    </div>
    \${logoSVG}
    <table class="cover-table">
      <tr><td>KELOMPOK</td><td>\${escHtml(nama)}</td></tr>
      <tr><td>NAMA/NIM</td><td>\${nimHtml}</td></tr>
      <tr><td>DOSEN PENGAMPU</td><td>Prof. Dr. Ir. Teuku Yuliar Arif, ST., M.Kom</td></tr>
    </table>
  </div>
  <div class="cover-bottom">
    PROGRAM STUDI TEKNIK KOMPUTER<br>
    DEPARTEMEN TEKNIK ELEKTRO DAN KOMPUTER<br>
    FAKULTAS TEKNIK<br>
    UNIVERSITAS SYIAH KUALA<br>
    2025
  </div>
</div>

<!-- Halaman 2 -->
<div class="page">
  \${headerFooter(2)}
  <div class="content">
    <div class="title-sec">
      CBL-1<br>
      Penerapan dan Analisis Enkripsi dan Dekripsi Informasi<br>
      menggunakan Algoritma DES
    </div>
    <div class="sec-hdr">1.1 Penerapan input plaintext dan kunci pada proses enkripsi untuk menghasilkan ciphertext Ronde-1 pada algoritma DES.</div>
    <div>Lakukan langkah-langkah sebagai berikut:</div>
    <div style="margin-left: 20px; text-indent: -20px; margin-top:5px;">
       1. Kelompok Anda diberikan informasi (plaintext) yang terdiri dari 8 karakter ASCII (ubah X menjadi nomor kelompok Anda).
    </div>
    <div style="margin-left: 20px; margin-top: 10px;">
      Plaintext kelompok Anda (ASCII) :<br>
      \${makeAsciiTable(ptChars, true)}
      <br>Plaintext kelompok Anda (Hexadecimal) :<br>
      \${makeHexTable(ptChars, GT.ptHex||[], true)}
      <br>Plaintext kelompok Anda (bit) :<br>
      \${makeBitTable(1, ptChars.slice(0,2), (GT.ptBin||[]).slice(0,16), true)}
      \${makeBitTable(17, ptChars.slice(2,4), (GT.ptBin||[]).slice(16,32), true)}
      \${makeBitTable(33, ptChars.slice(4,6), (GT.ptBin||[]).slice(32,48), true)}
      \${makeBitTable(49, ptChars.slice(6,8), (GT.ptBin||[]).slice(48,64), true)}
    </div>
    <div style="margin-left: 20px; text-indent: -20px; margin-top: 20px;">
       2. Plaintext Kelompok anda tersebut akan dienkrip menggunakan algoritma DES. Untuk mengenkrip plaintext tersebut, Kelompok Anda diberikan kunci (key) rahasia yang terdiri dari 8 karakter ASCII (ubah X menjadi nomor kelompok Anda).
    </div>
    <div style="margin-left: 20px; margin-top: 10px;">
      Kunci rahasia kelompok Anda (ASCII) :<br>
      \${makeAsciiTable(keyChars, false)}
    </div>
  </div>
</div>

<!-- Halaman 3 -->
<div class="page">
  \${headerFooter(3)}
  <div class="content">
    Kunci rahasia kelompok Anda (Hexadecimal) :<br>
    \${makeHexTable(keyChars, GT.keyHex||[], false)}
    <br>Kunci rahasia kelompok Anda (bit) :<br>
    \${makeBitTable(1, keyChars.slice(0,2), (GT.keyBin||[]).slice(0,16), false)}
    \${makeBitTable(17, keyChars.slice(2,4), (GT.keyBin||[]).slice(16,32), false)}
    \${makeBitTable(33, keyChars.slice(4,6), (GT.keyBin||[]).slice(32,48), false)}
    \${makeBitTable(49, keyChars.slice(6,8), (GT.keyBin||[]).slice(48,64), false)}
    
    <div style="margin-left: 20px; text-indent: -20px; margin-top: 20px;">
       3. Lakukan proses enkripsi plaintext kelompok anda menggunakan algoritma DES dengan menggunakan table permutasi, subsitusi, XOR dan lain-lain yang telah disediakan dibawah untuk mendapatkan ciphertext Ronde-1 kelompok anda.
    </div><br>
    <b>Initial Permutation (IP) :</b>
    <div style="margin-top: 10px; margin-left: 20px;">
      \${makeMultiBlockTable(IP_TABLE.slice(0, 48), (GT.ip||[]).slice(0, 48), 8)}
    </div>
  </div>
</div>

<!-- Halaman 4 -->
<div class="page">
  \${headerFooter(4)}
  <div class="content">
    <div style="margin-left: 20px;">
      \${makeMultiBlockTable(IP_TABLE.slice(48, 64), (GT.ip||[]).slice(48, 64), 8)}
    </div>
    <br><b>Hasil split 32-bit sebelah kiri:</b><br>
    \${makeMultiBlockTable(Array.from({length:32}, (_,i)=>i+1), GT.L0||[], 16)}
    <br><b>Hasil spit 32-bit sebelah kanan:</b><br>
    \${makeMultiBlockTable(Array.from({length:32}, (_,i)=>i+1), GT.R0||[], 16)}
    <br><b>Expansion Permutation (E) :</b><br>
    <div style="margin-left: 20px;">
      \${makeMultiBlockTable(E_TABLE.slice(0, 42), (GT.ER0||[]).slice(0, 42), 6)}
    </div>
  </div>
</div>

<!-- Halaman 5 -->
<div class="page">
  \${headerFooter(5)}
  <div class="content">
    <div style="margin-left: 20px;">
      \${makeMultiBlockTable(E_TABLE.slice(42, 48), (GT.ER0||[]).slice(42, 48), 6)}
    </div>
    <br><b>Input Key :</b><br>
    \${makeMultiBlockTable(inputKeyIndices, inputKeyValues, 14)}
    <br><b>Permuted Choice One (PC-1):</b><br>
    <div style="margin-left: 20px;">
      \${makeMultiBlockTable(pc1Indices, (GT.C0||[]).concat(GT.D0||[]), 8)}
    </div>
  </div>
</div>

<!-- Halaman 6 -->
<div class="page">
  \${headerFooter(6)}
  <div class="content">
    <b>Left shift(s) 28 bit sebelah kiri, 1-bit ke kiri :</b><br>
    <div style="margin-left: 20px;">
      \${makeMultiBlockTable(shifted_C_indices, GT.C1||[], 14)}
    </div>
    <br><b>Left shift(s) 28 bit sebelah kanan, 1-bit ke kiri :</b><br>
    <div style="margin-left: 20px;">
      \${makeMultiBlockTable(shifted_D_indices, GT.D1||[], 14)}
    </div>
    <br><b>Hasil penggabungan Left shift(s) 28 bit sebelah kiri dan 28 bit sebelah kanan :</b><br>
    \${makeMultiBlockTable(Array.from({length:56}, (_,i)=>i+1), (GT.C1||[]).concat(GT.D1||[]), 14)}
  </div>
</div>

<!-- Halaman 7 -->
<div class="page">
  \${headerFooter(7)}
  <div class="content">
    <b>Permuted Choice Two (PC-2):</b><br>
    <div style="margin-left: 20px;">
      \${makeMultiBlockTable(PC2_TABLE, GT.K1||[], 8)}
    </div>
    <br><b>XOR antara hasil Expansion Permutation dan Kunci Ronde-1:</b><br>
    \${makeXorTableP('16-bit yang pertama:', (GT.ER0||[]).slice(0,16), (GT.K1||[]).slice(0,16), (GT.xor1||[]).slice(0,16), 'E', 'Key')}
    \${makeXorTableP('16-bit yang kedua:', (GT.ER0||[]).slice(16,32), (GT.K1||[]).slice(16,32), (GT.xor1||[]).slice(16,32), 'E', 'Key')}
    \${makeXorTableP('16-bit yang ketiga:', (GT.ER0||[]).slice(32,48), (GT.K1||[]).slice(32,48), (GT.xor1||[]).slice(32,48), 'E', 'Key')}
  </div>
</div>

<!-- Halaman 8 -->
<div class="page">
  \${headerFooter(8)}
  <div class="content">
    <b>S-Box</b><br>
    \${sboxDetails}
    <br><b>Total 32-bit output Boks Subsitusi Ronde-1:</b><br>
    \${makeMultiBlockTable(Array.from({length:32}, (_,i)=>i+1), GT.sboxOutBits||[], 16)}
  </div>
</div>

<!-- Halaman 9 -->
<div class="page">
  \${headerFooter(9)}
  <div class="content">
    <b>Permutation Function (P):</b><br>
    <div style="margin-left: 20px;">
      \${makeMultiBlockTable(P_TABLE, GT.pbox||[], 8)}
    </div>
    <br><b>XOR 32-bit hasil Permutation Function (P) dengan hasil split 32-bit sebelah kiri<br>(pada Langkah awal):</b><br>
    \${makeXorTableP('16-bit yang pertama:', (GT.pbox||[]).slice(0,16), (GT.L0||[]).slice(0,16), (GT.R1||[]).slice(0,16), 'P1', 'S1')}
    \${makeXorTableP('16-bit yang kedua:', (GT.pbox||[]).slice(16,32), (GT.L0||[]).slice(16,32), (GT.R1||[]).slice(16,32), 'P2', 'S2')}
    <br><b>Penggabungan 32-bit bagian sebelah kanan hasil split 32-bit pada Langkah awal dengan 32-bit hasil XOR 32-bit untuk mendapatkan ciphertext rounde-1 Kelompok Anda:</b><br>
    \${makeMultiBlockTable(Array.from({length:64}, (_,i)=>i+1), (GT.R0||[]).concat(GT.R1||[]), 16)}
    <br><div style="margin-left: 20px; text-indent: -20px; margin-top: 20px;">
       4. Tuliskan ciphertext Ronde-1 kelompok anda (Hexadecimal):
    </div>
    <div style="margin-left: 20px;">
      \${makeHexTableCipher(GT.finalHex)}
    </div>
  </div>
</div>

<!-- Halaman 10 -->
<div class="page">
  \${headerFooter(10)}
  <div class="content">
    <div class="sec-hdr">1.2 Analisis penerapan input plaintext dan kunci pada proses enkripsi untuk menghasilkan ciphertext Ronde-1 pada algoritma DES.</div>
    <div>Buatkan analisis berdasarkan penerapan input plaintext dan kunci pada proses enkripsi untuk menghasilkan ciphertext Ronde-1 pada algoritma DES diatas:</div>
    <div class="analysis-box" style="padding: 10px; box-sizing: border-box; white-space: pre-wrap;">\${escHtml(analisaText)}</div>
  </div>
</div>
\`;

      let finalHtml = \`<div style="width:210mm;margin:0 auto;">
        <style>\${css}</style>\`;
      if (!forPdf) {
        finalHtml += \`<button class="print-btn" onclick="window.print()">🖨️ Cetak ke PDF Laporan Ini</button>\`;
      } else {
        // override untuk html2pdf khusus agar tidak blank page
        finalHtml += \`<style>.page{min-height:0!important;page-break-after:always;}</style>\`;
      }
      finalHtml += contentHtml + \`</div>\`;
      return finalHtml;
    }`;

let startIdx = content.indexOf('    function generateAcademicReportHTML');
if(startIdx === -1) {
    startIdx = content.indexOf('function generateAcademicReportHTML');
}
let endIdx = content.indexOf('    function generateAcademicReport(', startIdx);
if(startIdx !== -1 && endIdx !== -1) {
  // Let's make sure we find the end of the previous function accurately
  // We can just find the closing bracket before `function generateAcademicReport(`
  
  // Actually, we can just replace everything from startIdx to endIdx
  const result = content.substring(0, startIdx) + newFunc + '\n\n' + content.substring(endIdx);
  fs.writeFileSync('index.html', result);
  console.log('Patched index.html');
} else {
  console.log('Failed to find function bounds', startIdx, endIdx);
}
