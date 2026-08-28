# ZONE DE RASSEMBLEMENT

### *(Gathering Zone)* — A Web-Based Event Registration System

## 📌 App Overview

**Zone de Rassemblement (Gathering Zone)** is a **web-based event registration system** designed to simplify the organization, registration, and management of events.

The system allows users to browse available events, register and participate, while administrators can efficiently manage events, monitor participants, and communicate important updates through email notifications.

---

## 🎯 Goals

The system aims to:

* Build a user-friendly event registration platform
* Increase user participation in events
* Reduce uncertainty regarding event availability and participation
* Improve the efficiency of event management

---

## 🎯 Objectives

* Develop a web-based event registration system
* Enable users to register and participate in events
* Provide efficient participant tracking
* Implement an email notification system for event updates

---

## ❗ Statement of the Problem

Traditional event registration and management can be difficult due to:

* Difficulty in managing event registrations
* Lack of efficient participant tracking
* Absence of a centralized platform for event information
* Poor communication and updates between organizers and participants

---

## 💡 Proposed Solution

**Zone de Rassemblement** provides a centralized platform that helps organizers manage events and participants efficiently.

The system provides:

* Event creation and management
* User event registration
* Participant and guest tracking
* Email notifications for important updates
* Administrative monitoring and management tools

---

## ✨ Features

### 👤 User Features

* Browse available events
* View event details
* Register for events
* Cancel event registration
* Add a **plus-one guest**
* View event capacity/progress
* Receive email notifications for registration and cancellation

### 🛠️ Admin Features

* Create and manage events
* Set registration deadlines
* Set minimum and maximum participant limits
* Monitor event registration progress
* Manage registered users and participants
* Manage event cancellation
* Monitor event capacity
* Manage event gallery/photos

### 📊 Event Management

* Event creation with registration deadlines
* Minimum and maximum participant requirements
* Plus-one/guest system
* Event capacity progress bar
* Registration and cancellation tracking
* Event cancellation control
* Participant monitoring

### 📧 Email Notifications

The system provides email notifications for important event activities, including:

* Successful event registration
* Registration cancellation
* Event updates and changes

---

## 🧑‍💻 Tools & Technology Stack

### Frontend

* **Next.js**
* **Shadcn UI**
* **Tailwind CSS**

### Backend

* **Express.js**
* **Prisma ORM**
* **Nodemailer**

### Database

* **PostgreSQL**
* **Neon**

### Design & Version Control

* **Figma** — UI/UX design and prototyping
* **Git** — Version control
* **GitHub** — Repository and collaboration

---

## 🏗️ System Overview

```text
                    ZONE DE RASSEMBLEMENT
                             │
             ┌───────────────┴───────────────┐
             │                               │
           USER                            ADMIN
             │                               │
      ┌──────┴──────┐                ┌───────┴────────┐
      │             │                │                │
   View Events   Register        Manage Events    Manage Users
      │             │                │                │
      │        Plus-One Guest      Monitor         Gallery
      │             │             Participants       │
      └─────────────┴────────────────┴────────────────┘
                             │
                    Email Notifications
                             │
                         PostgreSQL
                           (Neon)
```

---

## 🔄 Registration Process

1. User browses available events.
2. User selects an event.
3. User views the event details and available capacity.
4. User registers for the event.
5. User may add a plus-one guest when allowed.
6. The system records the registration.
7. The user receives an email confirmation.
8. The administrator can monitor the registration and participant count.

---

## 📈 Event Capacity

The system helps administrators monitor event participation through **minimum and maximum participant limits**.

A progress bar provides a visual representation of the current registration status, allowing administrators and users to easily understand how many slots have been filled.

---

## 🎨 UI/UX Design

The system interface is designed using **Figma** before implementation.

The design focuses on:

* User-friendly navigation
* Clean and modern interface
* Responsive layout
* Easy event discovery
* Simple registration process
* Efficient administrative management

---

## 🔐 System Roles

### User

Users can:

* View available events
* View event information
* Register for events
* Add eligible guests
* Cancel registrations
* Receive event notifications

### Administrator

Administrators can:

* Manage events
* Manage users
* Monitor registrations
* Track participants
* Manage event capacity
* Cancel events
* Manage event photos/gallery
* Monitor system activities

---

## 🚀 Purpose

Zone de Rassemblement aims to provide a **centralized, accessible, and efficient event registration platform** that improves the experience of both event participants and administrators.

By replacing fragmented registration and communication processes with a single web-based system, the platform helps make event management more organized and participation easier.

---

## 👥 Project

**Project:** Zone de Rassemblement
**System Type:** Web-Based Event Registration System
**Platform:** Web Application
**Database:** PostgreSQL (Neon)

---

## 📄 License

This project is developed for **academic/capstone purposes**.
