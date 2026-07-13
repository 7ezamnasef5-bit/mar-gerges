const ADMIN_CODES = "9855"; 
const API_URL = "http://localhost:3000/api/makhdoumin"; // غيره لرابط Render عند النشر

let isEditing = false;
let currentEditingName = ""; // لحفظ اسم الطالب قبل التعديل

// 1. تسجيل الدخول
async function handleLogin() {
    const inputVal = document.getElementById('loginInput').value.trim();
    if (inputVal === "") return alert("من فضلك اكتب شيء للدخول!");

    if (ADMIN_CODES.includes(inputVal)) {
        switchScreen('adminSection');
        renderTable();
    } else {
        try {
            const response = await fetch(API_URL);
            const makhdoumin = await response.json();
            const foundUser = makhdoumin.find(user => user.name === inputVal);
            
            if (foundUser) {
                switchScreen('userSection');
                document.getElementById('userData').innerHTML = `
                    <div class="profile-item"><strong>👤 الاسم:</strong> ${foundUser.name}</div>
                    <div class="profile-item"><strong>📞 التليفون:</strong> ${foundUser.phone}</div>
                    <div class="profile-item"><strong>📍 العنوان:</strong> ${foundUser.address}</div>
                    <div class="profile-item"><strong>🎂 السن:</strong> ${foundUser.age} سنة</div>
                    <div class="profile-item" style="background:#d1fae5; color:#065f46;"><strong>🏆 الدرجة:</strong> ${foundUser.grade} درجات</div>
                `;
            } else {
                alert("الاسم غير مسجل أو الكود خطأ!");
            }
        } catch (error) {
            alert("فشل الاتصال بالسيرفر!");
        }
    }
}

// 2. معالجة الفورم (إضافة أو تعديل)
async function addMakhdoum(event) {
    event.preventDefault();

    const personData = {
        name: document.getElementById('name').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim(),
        age: parseInt(document.getElementById('age').value),
        grade: parseInt(document.getElementById('grade').value)
    };

    try {
        if (isEditing) {
            // إرسال طلب تعديل (PUT)
            const response = await fetch(API_URL, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ oldName: currentEditingName, updatedData: personData })
            });
            const result = await response.json();
            if (result.success) alert("تم تعديل بيانات الطالب بنجاح! ✏️");
            
            // إلغاء وضع التعديل وإرجاع الزرار لشغله الطبيعي
            isEditing = false;
            document.querySelector('#makhdoumForm button').innerText = "حفظ المخدوم في السيرفر ☁️";
            document.querySelector('#makhdoumForm button').style.backgroundColor = "var(--success)";
        } else {
            // إرسال طلب إضافة (POST)
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(personData)
            });
            const result = await response.json();
            if (result.success) alert(`تم تسجيل ${personData.name} بنجاح!`);
        }

        document.getElementById('makhdoumForm').reset();
        renderTable();
    } catch (error) {
        alert("حدث خطأ في الاتصال بالسيرفر!");
    }
}

// 3. جلب البيانات وعرض الجدول مع أزرار التحكم
async function renderTable() {
    const tbody = document.querySelector('#makhdoumTable tbody');
    tbody.innerHTML = "<tr><td colspan='6' style='text-align:center;'>جاري التحميل...</td></tr>";

    try {
        const response = await fetch(API_URL);
        const makhdoumin = await response.json();
        tbody.innerHTML = "";

        // إضافة عمود للتحكم في الهيدر لو مش موجود
        const theadRow = document.querySelector('#makhdoumTable thead tr');
        if (theadRow.cells.length === 5) {
            theadRow.innerHTML += "<th>التحكم</th>";
        }

        makhdoumin.forEach(user => {
            const row = `<tr>
                <td><strong>${user.name}</strong></td>
                <td>${user.phone}</td>
                <td>${user.address}</td>
                <td>${user.age}</td>
                <td><span style="color:var(--success); font-weight:bold;">${user.grade}</span></td>
                <td>
                    <button onclick="prepareEdit('${user.name}', '${user.phone}', '${user.address}', ${user.age}, ${user.grade})" style="width:auto; padding:5px 10px; background:#f39c12; color:white; font-size:12px; margin-left:5px; display:inline-block;">تعديل ✏️</button>
                    <button onclick="deleteMakhdoum('${user.name}')" style="width:auto; padding:5px 10px; background:#e74c3c; color:white; font-size:12px; display:inline-block;">حذف ❌</button>
                </td>
            </tr>`;
            tbody.innerHTML += row;
        });
    } catch (error) {
        tbody.innerHTML = "<tr><td colspan='6' style='text-align:center; color:red;'>فشل تحميل البيانات!</td></tr>";
    }
}

// 4. دالة تجهيز البيانات في الفورم للتعديل
function prepareEdit(name, phone, address, age, grade) {
    document.getElementById('name').value = name;
    document.getElementById('phone').value = phone;
    document.getElementById('address').value = address;
    document.getElementById('age').value = age;
    document.getElementById('grade').value = grade;

    isEditing = true;
    currentEditingName = name;

    // تغيير شكل زرار الحفظ لينبه الخادم أنه في وضع التعديل
    const submitBtn = document.querySelector('#makhdoumForm button');
    submitBtn.innerText = "تأكيد وتعديل البيانات الآن ✏️";
    submitBtn.style.backgroundColor = "#f39c12";
    
    // سحب الشاشة لفوق عند الفورم بسلاسة
    document.getElementById('makhdoumForm').scrollIntoView({ behavior: 'smooth' });
}

// 5. دالة حذف الطالب
async function deleteMakhdoum(name) {
    if (!confirm(`هل أنت متأكد من حذف الطالب (${name}) نهائياً من السيستم؟`)) return;

    try {
        const response = await fetch(API_URL, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name })
        });
        const result = await response.json();
        if (result.success) {
            alert("تم حذف الطالب من السيرفر.");
            renderTable();
        }
    } catch (error) {
        alert("فشل في حذف الطالب!");
    }
}

// 6. التنقل والlogout
function switchScreen(screenId) {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('adminSection').style.display = 'none';
    document.getElementById('userSection').style.display = 'none';
    document.getElementById(screenId).style.display = 'block';
}

function logout() {
    document.getElementById('loginInput').value = "";
    if(isEditing) {
        isEditing = false;
        document.getElementById('makhdoumForm').reset();
        const submitBtn = document.querySelector('#makhdoumForm button');
        submitBtn.innerText = "حفظ المخدوم في السيرفر ☁️";
        submitBtn.style.backgroundColor = "var(--success)";
    }
    switchScreen('loginSection');
}

// PWA التنزيل
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('downloadBtn').style.display = 'block';
});
document.getElementById('downloadBtn').addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt = null;
        document.getElementById('downloadBtn').style.display = 'none';
    }
});
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');