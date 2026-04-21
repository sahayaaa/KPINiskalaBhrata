const dataStaff = [
    // REDAKSI
    { id: 1, nama: "Faiz", divisi: "redaksi" },
    { id: 2, nama: "Nada", divisi: "redaksi" },
    { id: 3, nama: "Dania", divisi: "redaksi" },
    { id: 4, nama: "Gisel", divisi: "redaksi" },
    { id: 5, nama: "Maharani Mantika", divisi: "redaksi" },
    { id: 6, nama: "Nayla Enzethiana", divisi: "redaksi" },
    { id: 7, nama: "Shenny Nurhidayah", divisi: "redaksi" },
    { id: 8, nama: "Audrina Rustari", divisi: "redaksi" },

    // JAKER
    { id: 9, nama: "Bintang", divisi: "jaker" },
    { id: 10, nama: "Salwa", divisi: "jaker" },
    { id: 11, nama: "Indy", divisi: "jaker" },
    { id: 12, nama: "Rasyid", divisi: "jaker" },
    { id: 13, nama: "Yaumiedka Vitra", divisi: "jaker" },
    { id: 14, nama: "Anisa Nuraini", divisi: "jaker" },
    { id: 15, nama: "Siti Zahra", divisi: "jaker" },

    // PSDM
    { id: 16, nama: "Lili", divisi: "psdm" },
    { id: 17, nama: "Rifa", divisi: "psdm" },
    { id: 18, nama: "Aga", divisi: "psdm" },
    { id: 19, nama: "Lydia Wahyu", divisi: "psdm" },
    { id: 20, nama: "Nofari Tazkia", divisi: "psdm" },
    { id: 21, nama: "Rizal Tsaniya", divisi: "psdm" },
    { id: 22, nama: "Arfita Zahra", divisi: "psdm" },
    { id: 23, nama: "Yaffa Cantika Putri", divisi: "psdm" },

    // MEDKRAF
    { id: 24, nama: "Irfan", divisi: "medkraf" },
    { id: 25, nama: "Putri", divisi: "medkraf" },
    { id: 26, nama: "Amalya Azahra", divisi: "medkraf" },
    { id: 27, nama: "Sifa Anisa", divisi: "medkraf" },
    { id: 28, nama: "Syahrul Bisma", divisi: "medkraf" },
    { id: 29, nama: "Dinan Alfa", divisi: "medkraf" },
    { id: 30, nama: "Evelyne Rheiva", divisi: "medkraf" }
];

const userAccounts = {
    "admin": "admin13",
    "psdm": "psdm2026",
    "medkraf": "medkraf2026",
    "jaker": "jaker2026",
    "redaksi": "redaksi2026"
};

let currentUser = "";
let draftData = {}; 
let database = JSON.parse(localStorage.getItem('kpi_v2026_final')) || {};
let currentSort = "none";

function toggleDarkMode() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}
if(localStorage.getItem('theme') === 'dark') document.documentElement.classList.add('dark');

function limit(el, max) {
    if (parseFloat(el.value) > max) el.value = max;
    if (parseFloat(el.value) < 0 || el.value === "") el.value = 0;
}

function handleLogin() {
    const userInp = document.getElementById('username').value.toLowerCase().trim();
    const passInp = document.getElementById('password').value;

    if (userAccounts[userInp] && userAccounts[userInp] === passInp) {
        currentUser = userInp;
        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('dashboard-page').classList.remove('hidden');
        document.getElementById('display-divisi').innerText = "Dashboard: " + currentUser;

        if (currentUser === 'admin') {
            document.getElementById('admin-area').classList.remove('hidden');
            document.getElementById('admin-filter-area').classList.remove('hidden');
        }
        renderTable();
    } else {
        alert("Username atau Password salah");
    }
}

function toggleSortMpi() {
    const icon = document.getElementById('sort-icon');
    if (currentSort === "none") {
        currentSort = "desc";
        icon.innerText = "🔽";
    } else if (currentSort === "desc") {
        currentSort = "asc";
        icon.innerText = "🔼";
    } else {
        currentSort = "none";
        icon.innerText = "↕️";
    }
    renderTable();
}

function getStaffData(id, tw) {
    if (tw === 'all') {
        let totalKuan = 0, totalKual = 0, totalSine = 0, count = 0;
        ['tw1', 'tw2', 'tw3'].forEach(p => {
            const d = database[`${id}_${p}`];
            if (d) {
                totalKuan += parseFloat(d.kuan) || 0;
                totalKual += parseFloat(d.kual) || 0;
                totalSine += parseFloat(d.sine) || 0;
                count++;
            }
        });
        if (count === 0) return { kuan: '-', kual: '-', sine: '-', mpi: '0.00%', status: 'N/A' };
        
        const avgKuan = (totalKuan / count).toFixed(1);
        const avgKual = (totalKual / count).toFixed(1);
        const avgSine = (totalSine / count).toFixed(1);
        const mpiVal = ((parseFloat(avgKuan) + parseFloat(avgKual) + parseFloat(avgSine)) / 90) * 100;
        const mpiStr = mpiVal.toFixed(2) + "%";
        return { 
            kuan: avgKuan, kual: avgKual, sine: avgSine, mpi: mpiStr, 
            status: mpiVal >= 85 ? "EXCELLENT" : (mpiVal >= 70 ? "BAGUS" : (mpiVal >= 60 ? "NORMAL" : "KRITIS"))
        };
    }
    return database[`${id}_${tw}`] || { kuan: '', kual: '', sine: '', mpi: '0.00%', status: 'KRITIS' };
}

function renderTable() {
    const tbody = document.getElementById('table-body');
    const tw = document.getElementById('periode-tw').value;
    const filter = document.getElementById('filter-divisi').value;
    const actionArea = document.getElementById('action-area');
    tbody.innerHTML = '';

    if (tw === 'all' || currentUser === 'admin') actionArea.classList.add('hidden');
    else actionArea.classList.remove('hidden');

    const isAdmin = (currentUser === 'admin');
    let list = isAdmin ? dataStaff : dataStaff.filter(s => s.divisi === currentUser);
    if (isAdmin && filter !== 'all') list = list.filter(s => s.divisi === filter);

    if (currentSort !== "none") {
        list = [...list].sort((a, b) => {
            const mpiA = parseFloat(getStaffData(a.id, tw).mpi);
            const mpiB = parseFloat(getStaffData(b.id, tw).mpi);
            return currentSort === "desc" ? mpiB - mpiA : mpiA - mpiB;
        });
    }

    list.forEach(s => {
        const d = getStaffData(s.id, tw);
        const isReadonly = (tw === 'all' || isAdmin);
        
        tbody.innerHTML += `
            <tr class="dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-center">
                <td class="p-6 font-bold text-slate-700 dark:text-slate-200 text-left">${s.nama}</td>
                <td class="p-6 text-[10px] text-slate-400 font-black uppercase tracking-widest text-left">${s.divisi}</td>
                <td class="p-2"><input type="number" id="kuan-${s.id}" value="${d.kuan}" oninput="limit(this, 60); calc(${s.id})" ${isReadonly ? 'disabled' : ''}></td>
                <td class="p-2"><input type="number" id="kual-${s.id}" value="${d.kual}" oninput="limit(this, 15); calc(${s.id})" ${isReadonly ? 'disabled' : ''}></td>
                <td class="p-2"><input type="number" id="sine-${s.id}" value="${d.sine}" oninput="limit(this, 15); calc(${s.id})" ${isReadonly ? 'disabled' : ''}></td>
                <td class="p-4 text-indigo-600 dark:text-indigo-400 font-black text-xl" id="mpi-${s.id}">${d.mpi}</td>
                <td class="p-4 text-[10px] uppercase font-black ${getStatusClass(d.mpi)}" id="status-${s.id}">${d.status}</td>
            </tr>
        `;
    });
    if (isAdmin) updateAdminDashboards();
}

function calc(id) {
    const tw = document.getElementById('periode-tw').value;
    const kuan = parseFloat(document.getElementById(`kuan-${id}`).value) || 0;
    const kual = parseFloat(document.getElementById(`kual-${id}`).value) || 0;
    const sine = parseFloat(document.getElementById(`sine-${id}`).value) || 0;

    const mpiVal = ((kuan + kual + sine) / 90) * 100;
    const mpiStr = mpiVal.toFixed(2) + "%";
    let status = mpiVal >= 85 ? "EXCELLENT" : (mpiVal >= 70 ? "BAGUS" : (mpiVal >= 60 ? "NORMAL" : "KRITIS"));

    document.getElementById(`mpi-${id}`).innerText = mpiStr;
    const stEl = document.getElementById(`status-${id}`);
    stEl.innerText = status;
    stEl.className = `p-4 text-center text-[10px] uppercase font-black ${getStatusClass(mpiStr)}`;

    draftData[`${id}_${tw}`] = { kuan, kual, sine, mpi: mpiStr, status };
}

function simpanPermanen() {
    database = { ...database, ...draftData };
    localStorage.setItem('kpi_v2026_final', JSON.stringify(database));
    alert("✅ Data Berhasil Disimpan!");
    draftData = {};
    renderTable();
}

function getStatusClass(mpi) {
    const v = parseFloat(mpi);
    if (v >= 85) return "status-excellent";
    if (v >= 70) return "status-bagus";
    if (v >= 60) return "status-normal";
    return "status-kritis";
}

function updateAdminDashboards() {
    const tw = document.getElementById('periode-tw').value;
    const prevTw = tw === 'tw2' ? 'tw1' : (tw === 'tw3' ? 'tw2' : null);
    
    // LOAD SUPREME BLACKLIST (Pemenang Supreme dari periode sebelumnya)
    let supremeBlacklist = JSON.parse(localStorage.getItem('kpi_supreme_blacklist')) || [];

    let sumMpi = 0, countRet = 0, countCrit = 0;
    let stats = dataStaff.map(s => {
        const curr = getStaffData(s.id, tw);
        const m = parseFloat(curr.mpi) || 0;
        sumMpi += m;
        if (m >= 70) countRet++;
        if (m < 70 && m > 0) countCrit++;
        
        const pVal = prevTw ? parseFloat(getStaffData(s.id, prevTw).mpi || 0) : 0;
        return { ...s, mpi: m, sine: parseFloat(curr.sine) || 0, growth: pVal > 0 ? m - pVal : 0 };
    });

    const avg = sumMpi / dataStaff.length;
    const retPct = (countRet / dataStaff.length) * 100;
    
    document.getElementById('res-mpi-org').innerText = avg.toFixed(2) + "%";
    const stMpi = document.getElementById('status-mpi-org');
    stMpi.innerText = avg >= 70 ? "✅ TERCAPAI" : "❌ GAGAL";
    stMpi.className = "p-5 text-center text-[10px] w-28 " + (avg >= 70 ? "tercapai" : "tidak-tercapai");

    document.getElementById('res-retensi').innerText = retPct.toFixed(2) + "%";
    const stRet = document.getElementById('status-retensi');
    stRet.innerText = retPct >= 70 ? "✅ TERCAPAI" : "❌ GAGAL";
    stRet.className = "p-5 text-center text-[10px] w-28 " + (retPct >= 70 ? "tercapai" : "tidak-tercapai");

    document.getElementById('res-kritis').innerText = countCrit;

    // AWARDS LOGIC
    let winnersThisTW = new Set();
    const isEligible = (s) => !supremeBlacklist.includes(s.id) && !winnersThisTW.has(s.id);

    // 1. SUPREME ACHIEVER (Hanya yang belum pernah menang Supreme sebelumnya)
    const eligibleForSupreme = stats.filter(s => !supremeBlacklist.includes(s.id)).sort((a,b) => b.mpi - a.mpi);
    const supremeWinner = eligibleForSupreme[0];

    if (supremeWinner && supremeWinner.mpi > 0) {
        document.getElementById('award-supreme').innerText = supremeWinner.nama;
        winnersThisTW.add(supremeWinner.id);
        
        // Simpan ke Blacklist (hanya jika periode bukan 'all')
        if (tw !== 'all' && !supremeBlacklist.includes(supremeWinner.id)) {
            supremeBlacklist.push(supremeWinner.id);
            localStorage.setItem('kpi_supreme_blacklist', JSON.stringify(supremeBlacklist));
        }
    } else {
        document.getElementById('award-supreme').innerText = "-";
    }

    // 2. BEST OF DIVISI
    let bDivHtml = "";
    ['redaksi','jaker','psdm','medkraf'].forEach(d => {
        const b = stats.filter(s => s.divisi === d && isEligible(s)).sort((a,b) => b.mpi - a.mpi)[0];
        if(b && b.mpi > 0) { 
            bDivHtml += `<div>${d.toUpperCase()}: <span class="text-indigo-600 dark:text-indigo-400">${b.nama}</span></div>`; 
            winnersThisTW.add(b.id); 
        } else {
            bDivHtml += `<div class="text-slate-300 uppercase">${d}: -</div>`;
        }
    });
    document.getElementById('award-best-div').innerHTML = bDivHtml;

    // 3. THE RISING STAR
    const ris = stats.filter(s => isEligible(s)).sort((a,b) => b.growth - a.growth)[0];
    if(prevTw && ris && ris.growth > 0) {
        document.getElementById('award-rising').innerText = `${ris.nama} (+${ris.growth.toFixed(1)}%)`;
        winnersThisTW.add(ris.id);
    } else {
        document.getElementById('award-rising').innerText = (tw === 'all') ? "N/A" : "-";
    }

    // 4. SYNERGY & HARMONY
    const syn = stats.filter(s => isEligible(s)).sort((a, b) => b.sine - a.sine)[0];
    if (syn && syn.sine > 0) {
        document.getElementById('award-synergy').innerText = syn.nama;
        winnersThisTW.add(syn.id);
    } else {
        document.getElementById('award-synergy').innerText = "-";
    }

    // RANKING DIVISI
    const rBody = document.getElementById('divisi-ranking-body');
    rBody.innerHTML = '';
    ['redaksi','jaker','psdm','medkraf'].map(d => {
        const m = stats.filter(s => s.divisi === d);
        const score = m.length > 0 ? m.reduce((a,b) => a + b.mpi, 0) / m.length : 0;
        return { d, score };
    }).sort((a,b) => b.score - a.score).forEach((r, i) => {
        let col = r.score >= 70 ? "text-emerald-500" : (r.score >= 50 ? "text-amber-500" : "text-rose-500");
        rBody.innerHTML += `<div class="p-4 flex justify-between items-center"><span class="text-slate-400 font-bold">#${i+1}</span><span class="uppercase font-black text-indigo-600 dark:text-indigo-400">${r.d}</span><span class="font-mono ${col}">${r.score.toFixed(2)}%</span></div>`;
    });
}