# Firebase — เชื่อมข้อมูลสุขภาพส่วนตัว

แอปรุ่น 3 เตรียมโค้ด Firebase แล้ว แต่ยังไม่มีโปรเจกต์/config ของผู้ใช้ และยังไม่ได้สร้างฐานข้อมูลหรืออัปโหลดข้อมูลจริงให้

ใช้ Firebase Authentication สำหรับบัญชี, Cloud Firestore สำหรับบันทึกสุขภาพ/อาหาร/แชต และ Cloud Storage สำหรับรูป (เลือกเปิดได้) เว็บยังอยู่บน Vercel หรือ GitHub Pages ได้ ไม่ต้องย้าย hosting ไป Firebase

## 1. สร้างโปรเจกต์และ Web app
1. เปิด https://console.firebase.google.com/ แล้วสร้างหรือเลือกโปรเจกต์ของคุณ
2. Project settings → General → Your apps → เพิ่ม Web app (`</>`)
3. คัดลอก `firebaseConfig` ที่ Console แสดง ไม่ใช่ service account/private key
4. แอปใช้ Firebase JS SDK แบบ browser modules เวอร์ชัน 12.19.0 จาก gstatic โหลดเฉพาะเมื่อมี config ไม่มี Analytics

ตัวอย่างรูปแบบ (แทนทุกค่าด้วยค่าจริง ห้ามใช้ค่าในตัวอย่าง):
```json
{
  "apiKey": "YOUR_WEB_API_KEY",
  "authDomain": "YOUR_PROJECT.firebaseapp.com",
  "projectId": "YOUR_PROJECT",
  "storageBucket": "YOUR_ACTUAL_BUCKET",
  "messagingSenderId": "YOUR_SENDER_ID",
  "appId": "YOUR_APP_ID"
}
```

## 2. เปิดการเข้าสู่ระบบ
1. Build → Authentication → Get started
2. Sign-in method → Email/Password → Enable → Save
3. Settings → Authorized domains → เพิ่มโดเมนเว็บจริง เช่น `your-app.vercel.app` หรือ `username.github.io` ไม่ใส่ https:// หรือ path
4. ถ้าทดสอบ local ให้เพิ่ม `localhost`/โดเมนที่ใช้ด้วยตามการตั้งค่าโปรเจกต์

แอปมีสมัครบัญชี เข้าสู่ระบบ ออกจากระบบ และส่งอีเมลตั้งรหัสผ่านใหม่ รหัสผ่านไม่ได้เก็บใน JSON สุขภาพ ไม่ต้องเปิด anonymous sign-in

## 3. เปิด Cloud Firestore และเผยแพร่กฎ
1. Build → Firestore Database → Create database
2. ใช้ฐานข้อมูลเริ่มต้น `(default)` เลือกตำแหน่งจัดเก็บให้เหมาะสม และเริ่มด้วย Production mode
3. เปิดแท็บ Rules → แทนด้วยเนื้อหาของ `firestore.rules` ที่แนบ → Publish
4. ไม่ต้องสร้าง collection/document เอง แอปสร้างตอนบันทึกครั้งแรก

เส้นทางข้อมูล:
```text
users/{Firebase Auth UID}/programs/liver-reset-2026-09-21
```

เอกสารมี `schemaVersion`, `payload` (JSON สุขภาพ), `revision`, `updatedAt`, `photoRefs`

กฎอนุญาตเจ้าของ UID เท่านั้น ตรวจรูปแบบ/ขนาดส่วนห่อหุ้มและ revision ที่เพิ่มครั้งละ 1 ส่วน JSON ด้านในตรวจด้วย validate ในแอป กฎไม่ทำให้ payload เป็นข้อมูลสุขภาพที่ถูกต้องทางการแพทย์ เจ้าของโปรเจกต์/Admin SDK ยังเข้าถึงข้อมูลได้ตามสิทธิ์ผู้ดูแล นี่ไม่ใช่ end-to-end encryption

**อย่าใช้กฎ test mode ที่เปิด read/write สาธารณะ** และอย่าใช้ `request.auth != null` อย่างเดียวโดยไม่ตรวจ UID สำหรับข้อมูลสุขภาพส่วนตัว

## 4. เปิดรูปบนคลาวด์ (ทางเลือก)
ไม่เปิดขั้นตอนนี้ก็ซิงก์น้ำหนัก อาหาร เช็กลิสต์ เป้าหมาย และแชตได้ เพียงไม่เลือก “รวมรูป”

1. Build → Storage → Get started
2. Cloud Storage for Firebase ต้องใช้แผน Blaze ตามข้อกำหนดปัจจุบัน ตรวจเรื่อง billing/งบใน Console ก่อนเปิด ไม่ได้เปิดหรือเรียกเก็บเงินผ่านชุดไฟล์นี้
3. ใส่ชื่อ bucket จริงใน `storageBucket` อย่าเดานามสกุลว่าเป็น `.appspot.com` หรือ `.firebasestorage.app`
4. แท็บ Rules → วางเนื้อหา `storage.rules` → Publish
5. ดาวน์โหลดรูปผ่าน SDK `getBlob` แบบตรวจสิทธิ์ ไม่มีการเก็บ public download URL ลงฐานข้อมูล
6. หากรับรูปแล้วติด CORS ให้ตั้ง CORS ของ bucket ตามโดเมนจริง โดยคัดลอก `storage-cors.example.json` เป็น `storage-cors.json` และแทน origin ให้ตรง (ไม่ใช้ `*` หากไม่จำเป็น)

ใช้ Google Cloud CLI หลังเข้าสู่บัญชีผู้ดูแลโปรเจกต์ของคุณ:
```bash
gcloud storage buckets update gs://YOUR_ACTUAL_BUCKET --cors-file=storage-cors.json
```

ไฟล์รูปอยู่ใต้:
```text
users/{uid}/photos/{snapshot-id}/before.jpg
users/{uid}/photos/{snapshot-id}/after.jpg
```

รูปมีขนาดไม่เกิน 3 MiB/รูป และแอปบีบอัด JPEG ก่อนเก็บในเครื่อง รูปที่ส่งสำเร็จเก่าอาจยังอยู่ใน Storage หลังสร้างสำรองใหม่ เพราะใช้ path ใหม่เพื่อไม่ทับรูปของอีกเครื่อง ควรจัดการไฟล์เก่าใน Console เมื่อไม่ต้องการเก็บ (อย่าลบ path ที่สำรองปัจจุบันยังอ้างอิง)

## 5. เชื่อมแอปและนำข้อมูลเดิมเข้า
1. เปิดแอป → ปุ่มเมฆมุมขวาบน หรือ แผน → Firebase
2. วาง Web config เป็น JSON หรือวางส่วน `const firebaseConfig = {...};` จาก Console แล้วกดเชื่อม
3. สมัคร/เข้าสู่บัญชีส่วนตัว จะเห็นพื้นที่ใหม่ของบัญชีนี้ ข้อมูลโหมดเดิมไม่ได้หาย แต่ถูกแยกออกเพื่อไม่ส่งให้บัญชีอื่นโดยอัตโนมัติ
4. ถ้ามีข้อมูลเดิม เปิด “ย้ายข้อมูลหรือจัดการข้อมูลต่างกัน” → **นำบันทึกจากโหมดในเครื่องเดิมเข้าบัญชี** คัดลอกเฉพาะข้อมูล ไม่ลบต้นฉบับ และยังไม่ส่งขึ้นคลาวด์
5. หากต้องการรูปเดิมด้วย ให้ Export JSON ตอนอยู่โหมดเดิม แล้ว Import JSON หลังเข้าสู่บัญชี
6. กด **บันทึกขึ้นคลาวด์** ตรวจบัญชี/สรุปแล้วยืนยัน เลือกรวมรูปหากตั้ง Storage แล้ว
7. รอข้อความ **บันทึกบน Firebase แล้ว · รุ่น …** จึงถือว่าส่งสำเร็จ
8. อีกเครื่องใช้ config โปรเจกต์เดียวกันและบัญชีเดียวกัน → **รับข้อมูลจากคลาวด์** แล้วตรวจสรุปก่อนยืนยัน

เพื่อไม่ต้องวาง config ซ้ำทุกเครื่อง สามารถใส่ public Web config ใน `index.html` ตรง `const EMBEDDED_FIREBASE_CONFIG=null;` แทน null ด้วย object จริง แล้ว deploy ใหม่ได้ ค่า Web config ไม่ใช่สิทธิ์เข้าถึงข้อมูล; Authentication และ Security Rules เป็นตัวบังคับสิทธิ์ ห้ามใส่ service account/private key ลงเว็บ

## 6. รูปแบบซิงก์และข้อมูลต่างกัน
- เก็บในเครื่องก่อนเสมอ และส่ง snapshot ของโปรแกรม 30 วันทั้งชุด
- เปิด “ส่งการแก้ไขบันทึกอัตโนมัติเมื่อออนไลน์” ได้หลังเลือกชุดข้อมูลเริ่มต้น การส่งอัตโนมัติไม่รวมรูป
- ใช้ Firestore transaction ตรวจ revision ก่อนเขียน หากคลาวด์มีรุ่นใหม่จากอีกเครื่อง จะหยุด ไม่ merge หรือเขียนทับเงียบ ๆ
- กดตรวจคลาวด์ แล้วเลือก **รับข้อมูลจากคลาวด์** หรือ **ใช้ข้อมูลเครื่องนี้แทนคลาวด์** (มีการยืนยัน)
- การดึง cloud จะเก็บบันทึกข้อความก่อนหน้าไว้หนึ่งชุดในเครื่อง กู้ได้จาก “กู้บันทึกก่อนรับจากคลาวด์ล่าสุด” ฟังก์ชันนี้ไม่ย้อนรูป
- ไม่ใช่ live collaboration และไม่ได้ merge รายวัน/รายมื้ออัตโนมัติ แนะนำรับข้อมูลล่าสุดก่อนแก้บนเครื่องที่สอง
- เมื่อออฟไลน์ บันทึกในเครื่องยังได้ กลับออนไลน์แล้วจะลองส่งถ้าเปิด auto และไม่มี conflict การปิดแอปก่อนส่งสำเร็จอาจเหลือข้อมูลเฉพาะเครื่อง
- Firebase SDK ต้องใช้อินเทอร์เน็ตเมื่อยังไม่อยู่ใน HTTP cache แต่ส่วนติดตามที่แคชด้วย service worker ยังเปิดออฟไลน์ได้
- “ล้างข้อมูลในเครื่องนี้” ไม่ลบสำรองบน Firebase และปิด auto ก่อนล้าง เพื่อไม่ส่งชุดว่างไปทับคลาวด์
- ข้อมูลบัญชียังแคชไว้ในเบราว์เซอร์หลัง sign out ต้องล้างข้อมูลเว็บไซต์ด้วยหากเป็นเครื่องที่ใช้ร่วมกัน
- config/auth/session ไม่รวมอยู่ใน Export JSON สุขภาพ และไม่มีการนำข้อมูล guest เข้าบัญชีอัตโนมัติ

## 7. Deploy กฎด้วย CLI (ทางเลือก)
วางไฟล์ `firebase.json`, `firestore.rules`, `storage.rules` ที่แนบไว้ในโฟลเดอร์ทำงาน จากนั้นใช้ Firebase CLI ที่ติดตั้งและเข้าสู่ระบบแล้ว:
```bash
firebase deploy --only firestore:rules --project YOUR_PROJECT_ID
```
หากเปิด Storage แล้ว:
```bash
firebase deploy --only storage --project YOUR_PROJECT_ID
```

## ขอบเขตที่ทดสอบ
ทดสอบ UI/localStorage/IndexedDB/JSON/ออฟไลน์จริงด้วย Chromium และทดสอบ cloud flow ด้วย SDK จำลอง: แยกบัญชี/รูป, revision conflict, เลือกทับ, รับข้อมูล, ส่ง/รับรูป ไม่มี Firebase config จริง จึงยังไม่ได้ทดสอบ Authentication/Firestore/Storage production หรือทดสอบ rules ด้วย Emulator และยังไม่ได้ทดสอบ Safari บน iPhone จริง

ก่อนใช้กับข้อมูลจริง ควรทดสอบสองบัญชีให้บัญชี B อ่านเส้นทาง UID ของ A ไม่ได้ และทดสอบสองอุปกรณ์แก้ข้อมูลพร้อมกันเพื่อเห็น conflict

## เอกสารทางการ
- Web setup: https://firebase.google.com/docs/web/setup
- Email/password: https://firebase.google.com/docs/auth/web/password-auth
- Transactions: https://firebase.google.com/docs/firestore/manage-data/transactions
- Security rules: https://firebase.google.com/docs/rules/basics
- Storage download/CORS: https://firebase.google.com/docs/storage/web/download-files
- Storage billing: https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024
