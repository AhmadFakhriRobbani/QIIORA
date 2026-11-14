(function(){
  'use strict';
  window.QIIORA = window.QIIORA || {};

  var KEY_PREFIX = 'jurnal-sesi-';

  function defaultJurnal(bab){
    return {
      bab: bab,
      tahuSebelum: '',
      tigaHal: '',
      bingungPilihan: '',
      bingungTeks: '',
      kehidupan: '',
      aksi: '',
      keyakinan: { I1: 0, I2: 0, I3: 0, I4: 0 },
      exit: { tiga: '', dua: '', satu: '' },
      catatanSim: '',
      waktu: ''
    };
  }

  function gabung(bab, data){
    var full = defaultJurnal(bab);
    if(!data) return full;
    for(var k in data){ if(Object.prototype.hasOwnProperty.call(data, k)) full[k] = data[k]; }
    if(!full.keyakinan) full.keyakinan = { I1:0,I2:0,I3:0,I4:0 };
    if(!full.exit) full.exit = { tiga:'', dua:'', satu:'' };
    return full;
  }

  window.QIIORA.jurnal = {
    ambil: function(bab){
      var d = QIIORA.simpan.ambil(KEY_PREFIX + bab, null);
      return gabung(bab, d);
    },
    simpan: function(data){
      data.waktu = new Date().toISOString();
      return QIIORA.simpan.simpan(KEY_PREFIX + data.bab, data);
    },
    tambahCatatanSim: function(bab, teks){
      var d = this.ambil(bab);
      d.catatanSim = (d.catatanSim ? d.catatanSim + '\n' : '') + teks;
      return this.simpan(d);
    },
    hitungKata: function(s){
      var t = String(s || '').trim();
      if(!t) return 0;
      return t.split(/\s+/).filter(Boolean).length;
    },
    ringkasSemua: function(babList){
      var out = [];
      (babList || [1,2,3,4,5,6,7,8]).forEach(function(b){
        var d = QIIORA.jurnal.ambil(b);
        var isi = d.tigaHal && String(d.tigaHal).trim();
        if(isi){
          out.push('Bab ' + b + ': ' + isi.replace(/\s+/g, ' ').slice(0, 140));
        }
      });
      return out;
    },
    eksporTeks: function(data){
      var L = [];
      L.push('JURNAL BELAJAR — QIIORA');
      L.push('Bab/Sesi: ' + data.bab);
      L.push('');
      if(data.tahuSebelum && String(data.tahuSebelum).trim()){ L.push('SEBELUM BELAJAR: ' + data.tahuSebelum); L.push(''); }
      L.push('1. Tiga hal yang kupelajari:');
      L.push(data.tigaHal || '-'); L.push('');
      L.push('2. Bagian yang masih membingungkan:');
      if(data.bingungPilihan) L.push('   [' + data.bingungPilihan + ']');
      if(data.bingungTeks && String(data.bingungTeks).trim()) L.push('   ' + data.bingungTeks);
      L.push('');
      L.push('3. Aku melihatnya di kehidupan: ' + (data.kehidupan || '-')); L.push('');
      L.push('4. Aksi nyataku: ' + (data.aksi || '-')); L.push('');
      var k = data.keyakinan || {};
      L.push('5. Skala keyakinan: I1=' + (k.I1||0) + ' I2=' + (k.I2||0) + ' I3=' + (k.I3||0) + ' I4=' + (k.I4||0));
      L.push('');
      if(data.exit && (String(data.exit.tiga||'').trim() || String(data.exit.dua||'').trim() || String(data.exit.satu||'').trim())){
        L.push('EXIT TICKET 3-2-1:');
        L.push('   3 hal: ' + (data.exit.tiga || '-'));
        L.push('   2 hal menarik: ' + (data.exit.dua || '-'));
        L.push('   1 pertanyaan: ' + (data.exit.satu || '-'));
        L.push('');
      }
      if(data.catatanSim && String(data.catatanSim).trim()){
        L.push('CATATAN SIMULASI:');
        L.push(data.catatanSim);
      }
      return L.join('\n');
    },
    eksporMarkdown: function(data){
      return this.eksporTeks(data); // versi awal: teks polos cukup
    }
  };
})();