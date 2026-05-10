-- ============================================================
-- Healthcare Database Setup
-- Run this on your Neon DB
-- ============================================================

-- Drop tables if they exist (clean slate)
DROP TABLE IF EXISTS billing CASCADE;
DROP TABLE IF EXISTS medications CASCADE;
DROP TABLE IF EXISTS diagnoses CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS patients CASCADE;

-- ============================================================
-- CREATE TABLES
-- ============================================================

CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INTEGER NOT NULL,
    gender VARCHAR(10) NOT NULL,
    blood_type VARCHAR(5),
    contact VARCHAR(15)
);

CREATE TABLE doctors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    experience_years INTEGER NOT NULL
);

CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id),
    doctor_id INTEGER REFERENCES doctors(id),
    date DATE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('scheduled', 'completed', 'cancelled'))
);

CREATE TABLE diagnoses (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER REFERENCES appointments(id),
    condition VARCHAR(200) NOT NULL,
    severity VARCHAR(20) CHECK (severity IN ('mild', 'moderate', 'severe'))
);

CREATE TABLE medications (
    id SERIAL PRIMARY KEY,
    diagnosis_id INTEGER REFERENCES diagnoses(id),
    drug_name VARCHAR(100) NOT NULL,
    dosage VARCHAR(50) NOT NULL,
    duration_days INTEGER NOT NULL
);

CREATE TABLE billing (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER REFERENCES appointments(id),
    amount NUMERIC(10, 2) NOT NULL,
    payment_status VARCHAR(20) CHECK (payment_status IN ('paid', 'unpaid', 'pending'))
);

-- ============================================================
-- INSERT SAMPLE DATA
-- ============================================================

-- Patients
INSERT INTO patients (name, age, gender, blood_type, contact) VALUES
('Aarav Sharma', 34, 'Male', 'A+', '9876543210'),
('Priya Nair', 28, 'Female', 'B+', '9123456780'),
('Rohan Mehta', 52, 'Male', 'O+', '9988776655'),
('Sneha Iyer', 45, 'Female', 'AB-', '9871234560'),
('Karan Patel', 23, 'Male', 'B-', '9765432100'),
('Ananya Reddy', 38, 'Female', 'A-', '9654321890'),
('Vikram Singh', 60, 'Male', 'O-', '9543210987'),
('Divya Menon', 31, 'Female', 'A+', '9432109876'),
('Arjun Das', 47, 'Male', 'B+', '9321098765'),
('Meera Pillai', 55, 'Female', 'AB+', '9210987654'),
('Rahul Gupta', 29, 'Male', 'O+', '9109876543'),
('Pooja Joshi', 42, 'Female', 'A+', '9098765432'),
('Suresh Kumar', 65, 'Male', 'B+', '9087654321'),
('Lakshmi Rao', 36, 'Female', 'O+', '9876501234'),
('Nikhil Verma', 50, 'Male', 'AB+', '9765012345');

-- Doctors
INSERT INTO doctors (name, specialization, experience_years) VALUES
('Dr. Ramesh Kapoor', 'Cardiology', 20),
('Dr. Sunita Bose', 'Neurology', 15),
('Dr. Anil Tiwari', 'Orthopedics', 12),
('Dr. Kavitha Menon', 'Dermatology', 8),
('Dr. Suresh Pillai', 'General Medicine', 25),
('Dr. Preethi Nair', 'Gynecology', 18),
('Dr. Manoj Sharma', 'Pediatrics', 10),
('Dr. Deepa Iyer', 'Oncology', 22);

-- Appointments
INSERT INTO appointments (patient_id, doctor_id, date, status) VALUES
(1, 1, '2024-01-10', 'completed'),
(2, 5, '2024-01-12', 'completed'),
(3, 1, '2024-01-15', 'completed'),
(4, 2, '2024-01-18', 'completed'),
(5, 7, '2024-01-20', 'completed'),
(6, 3, '2024-01-22', 'completed'),
(7, 8, '2024-01-25', 'completed'),
(8, 6, '2024-01-28', 'completed'),
(9, 4, '2024-02-01', 'completed'),
(10, 1, '2024-02-05', 'completed'),
(11, 5, '2024-02-08', 'completed'),
(12, 2, '2024-02-10', 'completed'),
(13, 8, '2024-02-12', 'completed'),
(14, 3, '2024-02-15', 'completed'),
(15, 7, '2024-02-18', 'completed'),
(1, 5, '2024-03-01', 'completed'),
(3, 8, '2024-03-05', 'completed'),
(7, 1, '2024-03-10', 'completed'),
(2, 4, '2024-03-12', 'scheduled'),
(5, 6, '2024-03-15', 'scheduled'),
(4, 5, '2024-03-18', 'cancelled'),
(9, 2, '2024-03-20', 'scheduled'),
(10, 3, '2024-03-22', 'scheduled'),
(6, 7, '2024-03-25', 'cancelled'),
(11, 1, '2024-03-28', 'scheduled');

-- Diagnoses
INSERT INTO diagnoses (appointment_id, condition, severity) VALUES
(1, 'Hypertension', 'moderate'),
(2, 'Viral Fever', 'mild'),
(3, 'Coronary Artery Disease', 'severe'),
(4, 'Migraine', 'moderate'),
(5, 'Asthma', 'mild'),
(6, 'Fracture - Left Femur', 'severe'),
(7, 'Breast Cancer Stage 2', 'severe'),
(8, 'PCOS', 'moderate'),
(9, 'Eczema', 'mild'),
(10, 'Heart Failure', 'severe'),
(11, 'Diabetes Type 2', 'moderate'),
(12, 'Epilepsy', 'severe'),
(13, 'Lung Cancer Stage 3', 'severe'),
(14, 'Arthritis', 'moderate'),
(15, 'Pneumonia', 'moderate'),
(16, 'Hypertension', 'mild'),
(17, 'Pancreatic Cancer', 'severe'),
(18, 'Angina', 'moderate');

-- Medications
INSERT INTO medications (diagnosis_id, drug_name, dosage, duration_days) VALUES
(1, 'Amlodipine', '5mg once daily', 90),
(2, 'Paracetamol', '500mg twice daily', 5),
(3, 'Aspirin', '75mg once daily', 180),
(3, 'Atorvastatin', '40mg once daily', 180),
(4, 'Sumatriptan', '50mg as needed', 30),
(5, 'Salbutamol Inhaler', '2 puffs as needed', 60),
(6, 'Ibuprofen', '400mg thrice daily', 14),
(7, 'Tamoxifen', '20mg once daily', 365),
(8, 'Metformin', '500mg twice daily', 90),
(9, 'Hydrocortisone Cream', 'Apply twice daily', 21),
(10, 'Furosemide', '40mg once daily', 60),
(10, 'Carvedilol', '6.25mg twice daily', 60),
(11, 'Metformin', '1000mg twice daily', 180),
(12, 'Levetiracetam', '500mg twice daily', 365),
(13, 'Carboplatin', 'IV per protocol', 90),
(14, 'Naproxen', '250mg twice daily', 30),
(15, 'Azithromycin', '500mg once daily', 5),
(16, 'Losartan', '50mg once daily', 90),
(17, 'Gemcitabine', 'IV per protocol', 120),
(18, 'Nitroglycerin', '0.5mg sublingual as needed', 30);

-- Billing
INSERT INTO billing (appointment_id, amount, payment_status) VALUES
(1, 1500.00, 'paid'),
(2, 800.00, 'paid'),
(3, 3500.00, 'paid'),
(4, 1200.00, 'paid'),
(5, 900.00, 'paid'),
(6, 5000.00, 'pending'),
(7, 4500.00, 'paid'),
(8, 1800.00, 'paid'),
(9, 700.00, 'paid'),
(10, 6000.00, 'unpaid'),
(11, 1100.00, 'paid'),
(12, 2000.00, 'pending'),
(13, 8000.00, 'unpaid'),
(14, 1300.00, 'paid'),
(15, 1600.00, 'paid'),
(16, 1000.00, 'paid'),
(17, 9000.00, 'unpaid'),
(18, 2500.00, 'paid');
