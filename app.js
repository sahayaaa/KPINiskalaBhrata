const dataStaff = [
    { id: 1, nama: "Faiz", divisi: "redaksi" }, { id: 2, nama: "Nada", divisi: "redaksi" },
    { id: 3, nama: "Dania", divisi: "redaksi" }, { id: 4, nama: "Gisel", divisi: "redaksi" },
    { id: 5, nama: "Maharani Mantika", divisi: "redaksi" }, { id: 6, nama: "Nayla Enzethiana", divisi: "redaksi" },
    { id: 7, nama: "Shenny Nurhidayah", divisi: "redaksi" }, { id: 8, nama: "Audrina Rustari", divisi: "redaksi" },
    { id: 9, nama: "Bintang", divisi: "jaker" }, { id: 10, nama: "Salwa", divisi: "jaker" },
    { id: 11, nama: "Indy", divisi: "jaker" }, { id: 12, nama: "Rasyid", divisi: "jaker" },
    { id: 13, nama: "Yaumiedka Vitra", divisi: "jaker" }, { id: 14, nama: "Anisa Nuraini", divisi: "jaker" },
    { id: 15, nama: "Siti Zahra", divisi: "jaker" }, { id: 16, nama: "Lili", divisi: "psdm" },
    { id: 17, nama: "Rifa", divisi: "psdm" }, { id: 18, nama: "Aga", divisi: "psdm" },
    { id: 19, nama: "Lydia Wahyu", divisi: "psdm" }, { id: 20, nama: "Nofari Tazkia", divisi: "psdm" },
    { id: 21, nama: "Rizal Tsaniya", divisi: "psdm" }, { id: 22, nama: "Arfita Zahra", divisi: "psdm" },
    { id: 23, nama: "Yaffa Cantika Putri", divisi: "psdm" }, { id: 24, nama: "Irfan", divisi: "medkraf" },
    { id: 25, nama: "Putri", divisi: "medkraf" }, { id: 26, nama: "Amalya Azahra", divisi: "medkraf" },
    { id: 27, nama: "Sifa Anisa", divisi: "medkraf" }, { id: 28, nama: "Syahrul Bisma", divisi: "medkraf" },
    { id: 29, nama: "Dinan Alfa", divisi: "medkraf" }, { id: 30, nama: "Evelyne Rheiva", divisi: "medkraf" }
];

const userAccounts = {
    "admin": "admin13", "psdm": "psdm2026", "medkraf": "medkraf2026", "jaker": "jaker2026", "redaksi": "redaksi2026"
};

let currentUser = "";
let draftData = {}; 
let database = {}; 
let currentSort = "none";

// --- FUNGSI CLOUD STORAGE (FIREBASE) ---
async function loadDariFirebase() {
    try {
        const doc = await db.collection("kpi_data").doc("v2026_final").get();
        if (doc.exists) {
            database = doc.data();
        }
        renderTable();
    } catch (e) { console.error("Error loading:", e); }
}

async function simpanPermanen() {
    database = { ...database, ...draftData };
    try {
        await db.collection("kpi_data").doc("v2026_final").set(database);
        alert("✅ Berhasil Simpan ke Database Cloud!");
        draftData = {};
        renderTable();
    } catch (e) { alert("❌ Gagal: " + e.message); }
}

// --- LOGIKA DASHBOARD ---
function handleLogin() {
    const userInp = document.getElementById('username').value.toLowerCase().trim();
    const passInp = document.getElementById('password').value;

    if (userAccounts[userInp] === passInp) {
        currentUser = userInp;
        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('dashboard-page').classList.remove('hidden');
        document.getElementById('display-divisi').innerText = "Dashboard: " + currentUser;

        if (currentUser === 'admin') {
            document.getElementById('admin-area').classList.remove('hidden');
            document.getElementById('admin-filter-area').classList.remove('hidden');
        }
        loadDariFirebase();
    } else { alert("Username/Password Salah"); }
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
        list.sort((a, b) => {
            const mpiA = parseFloat(getStaffData(a.id, tw).mpi);
            const mpiB = parseFloat(getStaffData(b.id, tw).mpi);
            return currentSort === "desc" ? mpiB - mpiA : mpiA - mpiB;
        });
    }

    list.forEach(s => {
        const d = getStaffData(s.id, tw);
        const isReadonly = (tw === 'all' || isAdmin);
        tbody.innerHTML += `
            <tr class="dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-center">
                <td class="p-6 font-bold text-left">${s.nama}</td>
                <td class="p-6 text-[10px] text-slate-400 font-black uppercase text-left">${s.divisi}</td>
                <td class="p-2"><input type="number" id="kuan-${s.id}" value="${d.kuan}" oninput="limit(this, 60); calc(${s.id})" ${isReadonly ? 'disabled' : ''} class="w-16 bg-transparent text-center border-b dark:border-slate-700"></td>
                <td class="p-2"><input type="number" id="kual-${s.id}" value="${d.kual}" oninput="limit(this, 15); calc(${s.id})" ${isReadonly ? 'disabled' : ''} class="w-16 bg-transparent text-center border-b dark:border-slate-700"></td>
                <td class="p-2"><input type="number" id="sine-${s.id}" value="${d.sine}" oninput="limit(this, 15); calc(${s.id})" ${isReadonly ? 'disabled' : ''} class="w-16 bg-transparent text-center border-b dark:border-slate-700"></td>
                <td class="p-4 text-indigo-600 font-black text-xl" id="mpi-${s.id}">${d.mpi}</td>
                <td class="p-4 text-[10px] font-black ${getStatusColor(d.mpi)}" id="status-${s.id}">${d.status}</td>
            </tr>`;
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
    const status = mpiVal >= 85 ? "EXCELLENT" : (mpiVal >= 70 ? "BAGUS" : (mpiVal >= 60 ? "NORMAL" : "KRITIS"));
    
    document.getElementById(`mpi-${id}`).innerText = mpiStr;
    document.getElementById(`status-${id}`).innerText = status;
    document.getElementById(`status-${id}`).className = `p-4 text-[10px] font-black ${getStatusColor(mpiStr)}`;
    draftData[`${id}_${tw}`] = { kuan, kual, sine, mpi: mpiStr, status };
}

function getStaffData(id, tw) {
    if (tw === 'all') {
        let total = 0, count = 0;
        ['tw1', 'tw2', 'tw3'].forEach(p => {
            if (database[`${id}_${p}`]) { total += parseFloat(database[`${id}_${p}`].mpi); count++; }
        });
        if (count === 0) return { kuan: '-', kual: '-', sine: '-', mpi: '0%', status: 'N/A' };
        const avg = (total / count);
        return { kuan: 'Avg', kual: 'Avg', sine: 'Avg', mpi: avg.toFixed(2) + "%", status: avg >= 70 ? "STABIL" : "KRITIS" };
    }
    return database[`${id}_${tw}`] || { kuan: '', kual: '', sine: '', mpi: '0.00%', status: 'KRITIS' };
}

function getStatusColor(mpi) {
    const v = parseFloat(mpi);
    return v >= 85 ? "text-indigo-500" : (v >= 70 ? "text-emerald-500" : (v >= 60 ? "text-amber-500" : "text-rose-500"));
}

function limit(el, max) {
    if (parseFloat(el.value) > max) el.value = max;
    if (parseFloat(el.value) < 0 || el.value === "") el.value = 0;
}

function toggleDarkMode() { document.documentElement.classList.toggle('dark'); }

function toggleSortMpi() {
    currentSort = currentSort === "desc" ? "asc" : "desc";
    document.getElementById('sort-icon').innerText = currentSort === "desc" ? "🔽" : "🔼";
    renderTable();
}

function updateAdminDashboards() {
    const tw = document.getElementById('periode-tw').value;
    let sumMpi = 0, countCrit = 0;
    dataStaff.forEach(s => {
        const m = parseFloat(getStaffData(s.id, tw).mpi);
        sumMpi += m; if (m < 70 && m > 0) countCrit++;
    });
    const avg = sumMpi / dataStaff.length;
    document.getElementById('res-mpi-org').innerText = avg.toFixed(2) + "%";
    document.getElementById('res-kritis').innerText = countCrit;
    document.getElementById('status-mpi-org').innerText = avg >= 70 ? "✅ TERCAPAI" : "❌ GAGAL";
}
