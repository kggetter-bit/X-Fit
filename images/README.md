# ภาพประกอบรุ่น 3
- wellness-atlas.png: ภาพอาหาร 8 ช่อง + ท่าออกกำลัง 8 ช่องในตาราง 4×4 ใช้ SVG viewport แสดงแต่ละช่อง ไม่ได้สร้างรูป JPG แยก
- sunrise.png: ฉากแสงเช้าบนหน้า Today
- ภาพทั้งสองสร้างด้วย ImageGen และแนบอยู่ในชุดไฟล์ อ่าน prompt/บทบาทใน ASSETS.md
- หากมี JPG ชื่อตรงรายการด้านล่าง จะใช้ JPG นั้นทับภาพมาตรฐาน
- หากทั้ง JPG และ atlas ไม่มี จะกลับเป็น placeholder/emoji
- ภาพเป็นภาพประกอบ ไม่ใช่ขนาดอาหารจริงหรือสื่อยืนยันเทคนิคท่าฝึก

## อาหาร
- boiled-eggs.jpg
- chicken-salad.jpg
- steamed-fish.jpg
- greek-yogurt.jpg
- tofu.jpg
- tuna-salad.jpg

## ออกกำลัง
- squat.jpg
- pushup.jpg
- situp.jpg
- plank.jpg
- lunge.jpg
- glute-bridge.jpg
- walking.jpg
- stretching.jpg

ภาพต้มยำกุ้งใช้ path steamed-fish.jpg ร่วมกัน และอกไก่ Air Fryer ใช้ chicken-salad.jpg
หากต้องการภาพเฉพาะเมนู เปลี่ยน path ในตัวแปร foods ของ index.html
แนะนำภาพ 800 × 600 px ขนาดไม่เกิน 300 KB ต่อภาพ ไม่มีการดึงรูปจากภายนอก
icon-192.png และ icon-512.png เป็นไอคอนแอปที่แนบมา ใช้สำหรับ PWA
ภาพ Before/After ไม่อยู่ในโฟลเดอร์นี้ แต่เก็บใน IndexedDB บนเครื่องผู้ใช้
