import dayjs, { Dayjs } from "dayjs";

interface Medicine {
  id: string;
  name: string;
  price: number;
  stock: number;
  weight: number;
  description: string;
}

interface Report {
  id: string;
  roomNumber: string;
  patient: Patient;
  description: string;
  dateReported: Dayjs;
  reportedBy: Staff;
  division: string;
}

interface Prescription {
  id: string;
  queue: Queue;
  roomNumber: string;
  notes: string;
  doctor: Staff;
  patient: Patient;
  status: string;
  bed: Bed;
}

interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  shift: Shift;
}

interface Queue {
  queueID: string;
  name: string;
  priority: number;
}

interface Patient {
  id: string;
  name: string;
  phone: string;
  gender: string;
  dob: Dayjs;
  email: string;
  address: string;
}

interface Shift {
  id: string;
  name: string;
  startHour: string;
  endHour: string;
}

interface Certificate {
  id: string;
  patient: Patient;
  doctor: Staff;
  type: string;
  dateRequested: Dayjs;
  status: string;
}

interface Job {
  id: string;
  name: string;
  status: string;
  category: string;
  assignDate: Dayjs;
  dueDate: Dayjs;
  description: string;
  roomID: string;
  patient: Patient;
  staff: Staff;
  bedID: string;
}

interface RoomType {
  id: string;
  name: string;
  maxBedCapacity: number;
  pricePerDay: number;
}

interface Room {
  id: string;
  roomType: RoomType;
  buildingNumber: string;
  floorNumber: string;
  bedQuantity: number;
  bedList: Bed[];
}

interface Bed {
  id: string;
  status: string;
  patient: Patient;
  sickness: string;
  roomID: string;
  number: string;
  doctor: Staff;
}

interface Appointment {
  id: string;
  patient: Patient;
  doctor: Staff;
  roomID: string;
  bed: Bed;
  queueCategory: string;
  queueNumber: number;
  status: string;
  appointmentDate: Dayjs;
  result: string;
}

export type { Medicine, Report, Prescription, Staff, Queue, Patient, Shift, Certificate, Job, Room, RoomType, Bed, Appointment };
