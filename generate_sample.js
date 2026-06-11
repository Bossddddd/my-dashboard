const fs = require('fs');

const teams = ['ทีม A (กรุงเทพฯ)', 'ทีม B (ภาคเหนือ)', 'ทีม C (ภาคตะวันออก)', 'ทีม D (ภาคใต้)', 'ทีม E (ภาคอีสาน)'];
const technicians = ['ช่างสมชาย', 'ช่างวิชัย', 'ช่างกิตติ', 'ช่างเอก', 'ช่างนพดล', 'ช่างสุชาติ', 'ช่างมานะ', 'ช่างศักดิ์ชัย'];
const priorities = ['low', 'normal', 'high', 'urgent'];
const statuses = ['reported', 'assigned', 'in_progress', 'waiting_parts', 'completed', 'cancelled'];
const categories = ['เครื่องยนต์', 'ระบบไฟฟ้า', 'ช่วงล่าง', 'แอร์', 'เบรก', 'ตัวถัง'];
const brandsModels = [
  { brand: 'Toyota', models: ['Hilux Revo', 'Commuter', 'Fortuner'] },
  { brand: 'Isuzu', models: ['D-Max', 'MU-X', 'Elf'] },
  { brand: 'Ford', models: ['Ranger', 'Everest'] },
  { brand: 'Nissan', models: ['Navara', 'Urvan'] },
  { brand: 'Mitsubishi', models: ['Triton', 'Pajero Sport'] }
];
const locations = [
  { label: 'ลานจอดรถ บิ๊กซี พระราม 4', lat: 13.7188, lng: 100.5684 },
  { label: 'ตึกสำนักงานใหญ่ สุขุมวิท', lat: 13.7367, lng: 100.5604 },
  { label: 'ทางหลวงหมายเลข 118 (ดอยสะเก็ด)', lat: 18.9103, lng: 99.2562 },
  { label: 'นิคมอุตสาหกรรมแหลมฉบัง', lat: 13.0807, lng: 100.9169 },
  { label: 'มอเตอร์เวย์ ขาออก กม. 45', lat: 13.5204, lng: 101.0021 },
  { label: 'จุดพักรถ ปตท. อยุธยา', lat: 14.2482, lng: 100.6214 },
  { label: 'ถนนมิตรภาพ โคราช', lat: 14.9799, lng: 102.0978 },
  { label: 'สี่แยกปฐมพร ชุมพร', lat: 10.4930, lng: 99.1800 },
  { label: 'สนามบินสุวรรณภูมิ', lat: 13.6900, lng: 100.7501 },
  { label: 'นิคมอุตสาหกรรมบางปู', lat: 13.5350, lng: 100.6439 }
];

const descriptions = [
  'เครื่องยนต์สตาร์ทไม่ติด สตาร์ทเตอร์เสีย',
  'ระบบไฟหน้าช็อต หลอดขาดหมด',
  'ยางแตกและแม็กดุ้งระหว่างทาง',
  'แอร์ไม่เย็น คอมเพรสเซอร์ไม่ตัด',
  'เบรกมีเสียงดังและเบรกไม่อยู่',
  'น้ำมันเครื่องรั่วซึมใต้ท้องรถ',
  'แบตเตอรี่เสื่อม ไฟไม่พอสตาร์ท',
  'ความร้อนขึ้นสูง หม้อน้ำรั่ว',
  'สายพานขาดคาเครื่อง',
  'คลัตช์ลื่น เข้าเกียร์ไม่ได้'
];

const symptomsList = [
  'สตาร์ทเงียบ',
  'ไฟส่องสว่างไม่ทำงาน',
  'พวงมาลัยสั่น',
  'ลมร้อน',
  'เสียงดังเอี๊ยด',
  'มีคราบน้ำมันพื้น',
  'ไฟหน้าปัดโชว์',
  'เกจความร้อนขึ้น H',
  'เสียงดังปังในห้องเครื่อง',
  'เหยียบคลัตช์จม'
];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

let csvContent = 'plate,brand,model,teamName,technicianName,priority,status,category,description,symptoms,locationLabel,latitude,longitude,cost,reportedAt,assignedAt,startedAt,completedAt,dueDate\n';

const now = new Date();
const past3Months = new Date();
past3Months.setMonth(now.getMonth() - 3);

for (let i = 0; i < 100; i++) {
  const province = ['กท', 'ชร', 'ชบ', 'นว', 'ขก', 'สข'][Math.floor(Math.random() * 6)];
  const num = Math.floor(1000 + Math.random() * 9000);
  const plate = `${province}-${num}`;
  
  const bm = getRandom(brandsModels);
  const brand = bm.brand;
  const model = getRandom(bm.models);
  
  const teamName = getRandom(teams);
  const technicianName = getRandom(technicians);
  const priority = getRandom(priorities);
  const status = getRandom(statuses);
  const category = getRandom(categories);
  
  const descIdx = Math.floor(Math.random() * descriptions.length);
  const description = descriptions[descIdx];
  const symptoms = symptomsList[descIdx];
  
  // Random location with slight coordinate jitter
  const loc = getRandom(locations);
  const lat = (loc.lat + (Math.random() - 0.5) * 0.05).toFixed(6);
  const lng = (loc.lng + (Math.random() - 0.5) * 0.05).toFixed(6);
  const locationLabel = loc.label;
  
  const reportedAt = generateDate(past3Months, now);
  let assignedAt = '', startedAt = '', completedAt = '';
  let cost = 0;
  
  // Due date is usually 1-5 days after reported
  const dueDate = new Date(reportedAt.getTime() + (1 + Math.random() * 4) * 24 * 60 * 60 * 1000);
  
  if (status !== 'reported') {
    assignedAt = new Date(reportedAt.getTime() + Math.random() * 4 * 3600 * 1000).toISOString();
  }
  if (['in_progress', 'waiting_parts', 'completed'].includes(status)) {
    startedAt = new Date(new Date(assignedAt).getTime() + Math.random() * 24 * 3600 * 1000).toISOString();
  }
  if (status === 'completed') {
    completedAt = new Date(new Date(startedAt).getTime() + Math.random() * 48 * 3600 * 1000).toISOString();
    cost = Math.floor(Math.random() * 10000) + 500;
  }
  
  const reportedStr = reportedAt.toISOString();
  const dueStr = dueDate.toISOString();
  
  csvContent += `${plate},${brand},${model},${teamName},${technicianName},${priority},${status},${category},${description},${symptoms},${locationLabel},${lat},${lng},${cost},${reportedStr},${assignedAt},${startedAt},${completedAt},${dueStr}\n`;
}

fs.writeFileSync('sample_data_teams_100.csv', csvContent, 'utf8');
console.log('sample_data_teams_100.csv generated successfully!');
