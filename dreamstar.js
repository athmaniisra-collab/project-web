function switchForm(formType) {
    // جلب البطاقتين
    const loginP = document.getElementById('loginPanel');
    const registerP = document.getElementById('registerPanel');

    if (formType === 'register') {
        loginP.classList.remove('active');    // إخفاء الدخول
        registerP.classList.add('active');     // إظهار التسجيل
    } else {
        registerP.classList.remove('active'); // إخفاء التسجيل
        loginP.classList.add('active');      // إظهار الدخول
    }
}
document.querySelectorAll('.column').forEach((column, index) => {
    column.addEventListener('click', function (e) {
        const targetUrl = document.querySelectorAll('.side-menu a')[index].href;
        
        // 1. حساب الموقع الحالي للفقاعة قبل البدء
        const rect = this.getBoundingClientRect();
        
        // تثبيت أبعاد الفقاعة الحالية لكي لا تقفز عند تحويلها لـ Fixed
        this.style.top = rect.top + 'px';
        this.style.left = rect.left + 'px';
        this.style.width = rect.width + 'px';
        this.style.height = rect.height + 'px';

        // 2. تفعيل تأثير التلاشي للعناصر الأخرى
        document.querySelector('.title').classList.add('fade-out');
        document.querySelectorAll('.column').forEach(c => {
            if (c !== this) c.classList.add('fade-out');
        });

        setTimeout(() => {
            this.classList.add('expanding');
            this.style.top = '0';
            this.style.left = '0';
            this.style.width = '100vw';
            this.style.height = '100vh';
        }, 50);
        setTimeout(() => {
            this.style.filter = 'blur(30px)';
            this.style.opacity = '0';
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 500);
        }, 1300);
    });
});
// كود لإظهار العناصر مجدداً عند العودة للصفحة أو تحميلها
window.addEventListener('pageshow', function(event) {
    // التحقق مما إذا كانت الصفحة محملة من "التاريخ/الذاكرة المخبأة" (عند الضغط على Back)
    if (event.persisted || (window.performance && window.performance.navigation.type === 2)) {
        
        // 1. إزالة فئة التلاشي عن العنوان وكل الدوائر
        document.querySelector('.title').classList.remove('fade-out');
        document.querySelectorAll('.column').forEach(c => {
            c.classList.remove('fade-out');
            c.classList.remove('expanding'); // إزالة تأثير التوسع أيضاً
            
            // 2. إعادة الستايلات الأصلية التي تم تغييرها برمجياً
            c.style.filter = '';
            c.style.opacity = '';
            c.style.position = ''; // يعود للوضع الطبيعي في CSS
            c.style.width = '';
            c.style.height = '';
            c.style.top = '';
            c.style.left = '';
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const columns = document.querySelectorAll('.column');
    const weatherContainer = document.createElement('div');
    weatherContainer.className = 'weather-container';
    document.body.appendChild(weatherContainer);

    let particleInterval; // متغير لتخزين المعرّف الخاص بإنشاء الجزيئات

    // دالة لإنشاء جزيء واحد (إيموجي)
    const createParticle = () => {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // موضع أفقي عشوائي
        particle.style.left = Math.random() * 100 + 'vw';
        
        // حجم عشوائي قليلاً
        const scale = 0.8 + Math.random() * 0.4;
        particle.style.transform =`scale(${scale})`;
        
        // مدة حركة عشوائية لتبدو طبيعية (بين 6s و 11s مثل كودك)
        particle.style.animationDuration = (6 + Math.random() * 5) + 's';

        weatherContainer.appendChild(particle);

        // إزالة العنصر من الـ DOM بعد انتهاء الحركة لتوفير الذاكرة
        particle.addEventListener('animationend', () => {
            particle.remove();
        });
    };
});

document.getElementById("messageForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());

      await fetch("/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      alert("Message scheduled!");
    });


    const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  to: String,
  content: String,
  sendAt: Date,
  status: { type: String, default: "pending" }
});

module.exports = mongoose.model("Message", messageSchema);


const express = require("express");
//const mongoose = require("mongoose");
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const Message = require("./models/Message");

const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use(express.static("views"));

// اتصال بقاعدة البيانات
mongoose.connect("mongodb://127.0.0.1:27017/emailScheduler", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// حفظ الرسالة
app.post("/messages", async (req, res) => {
  const { to, content, sendAt } = req.body;
  const msg = new Message({ to, content, sendAt });
  await msg.save();
  res.json({ success: true });
});

// إعداد nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "yourEmail@gmail.com",
    pass: "yourPassword"
  }
});

// فحص دوري كل دقيقة
cron.schedule("* * * * *", async () => {
  const now = new Date();
  const messages = await Message.find({ status: "pending", sendAt: { $lte: now } });

  for (let msg of messages) {
    try {
      await transporter.sendMail({
        from: "yourEmail@gmail.com",
        to: msg.to,
        subject: "Scheduled Message",
        text: msg.content
      });

      msg.status = "sent";
      await msg.save();
      console.log(`Message sent to ${msg.to}`);
    } catch (err) {
      console.error("Error sending email:", err);
    }
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
