const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const FILE_PATH = './database.json';

const readData = () => {
    if (!fs.existsSync(FILE_PATH)) return [];
    const data = fs.readFileSync(FILE_PATH, 'utf-8');
    return data ? JSON.parse(data) : [];
};

const writeData = (data) => {
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
};

// 1. جلب كل المخدومين
app.get('/api/makhdoumin', (req, res) => {
    res.json(readData());
});

// 2. إضافة مخدوم جديد
app.post('/api/makhdoumin', (req, res) => {
    const makhdoumin = readData();
    const newMakhdoum = req.body;
    newMakhdoum.createdAt = new Date();
    makhdoumin.push(newMakhdoum);
    writeData(makhdoumin);
    res.status(201).json({ success: true, message: "تم الحفظ!" });
});

// 3. تعديل بيانات مخدوم (بناءً على اسمه القديم)
app.put('/api/makhdoumin', (req, res) => {
    const makhdoumin = readData();
    const { oldName, updatedData } = req.body;
    
    const index = makhdoumin.findIndex(user => user.name === oldName);
    if (index !== -1) {
        // تحديث البيانات مع الحفاظ على تاريخ الإنشاء الأصلي
        makhdoumin[index] = { ...makhdoumin[index], ...updatedData };
        writeData(makhdoumin);
        return res.json({ success: true, message: "تم التعديل بنجاح!" });
    }
    res.status(404).json({ success: false, message: "المخدوم غير موجود" });
});

// 4. حذف مخدوم (بناءً على اسمه)
app.delete('/api/makhdoumin', (req, res) => {
    let makhdoumin = readData();
    const { name } = req.body;
    
    const originalLength = makhdoumin.length;
    makhdoumin = makhdoumin.filter(user => user.name !== name);
    
    if (makhdoumin.length < originalLength) {
        writeData(makhdoumin);
        return res.json({ success: true, message: "تم الحذف بنجاح!" });
    }
    res.status(404).json({ success: false, message: "المخدوم غير موجود" });
});

// تشغيل السيرفر على البورت الذي تحدده الاستضافة تلقائياً أو 3000 كاحتياطي
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`السيرفر شغال على بورت: ${PORT}`);
});