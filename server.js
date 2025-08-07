// --- Khai báo các thư viện cần thiết ---
const express = require('express');
const cors = require('cors');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

// --- Khởi tạo và kết nối đến database ---
const adapter = new FileSync('db.json');
const db = low(adapter);

// --- Cấu hình Server ---
const app = express();
const PORT = 3000;

app.use(cors()); // Cho phép frontend ở domain khác gọi vào
app.use(express.json()); // Đọc được dữ liệu JSON từ request

// --- Xây dựng các API Endpoints ---

// 1. API để lấy toàn bộ dữ liệu CV
// GET http://localhost:3000/api/cv
app.get('/api/cv', (req, res) => {
    // Lấy tất cả các mục từ file db.json
    const profile = db.get('profile').value();
    const skills = db.get('skills').value();
    const experience = db.get('experience').value();
    const education = db.get('education').value();
    const projects = db.get('projects').value();
    const interests = db.get('interests').value();
    
    // Gộp tất cả vào một object và trả về
    res.json({ 
        profile, 
        skills, 
        experience,
        education,
        projects,
        interests
    });
});

// 2. API để xử lý chat
// POST http://localhost:3000/api/chat
// Body request: { "message": "nội dung chat" }
app.post('/api/chat', (req, res) => {
  const userMessage = (req.body.message || '').toLowerCase();
  const scripts = db.get('chatbot_scripts').value();

  // Mặc định là câu trả lời cuối cùng (fallback)
  let reply = scripts[scripts.length - 1].answer;

  // Duyệt qua từng kịch bản (trừ cái cuối)
  for (let i = 0; i < scripts.length - 1; i++) {
    const script = scripts[i];
        // Nếu có một từ khóa trong kịch bản khớp với tin nhắn người dùng
    if (script.keywords.some(kw => userMessage.includes(kw))) {
      reply = script.answer; // Lấy câu trả lời đó
      break; // Và thoát khỏi vòng lặp
    }
  }

  // Trả về câu trả lời dưới dạng JSON
  res.json({ reply: reply });
});

// --- Khởi động Server ---
app.listen(PORT, () => {
  console.log(`✅ Backend server đã sẵn sàng tại http://localhost:${PORT}`);
    console.log('Bạn có thể kiểm tra API bằng cách mở trình duyệt và truy cập:');
    console.log(`   http://localhost:${PORT}/api/cv`);
});
