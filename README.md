# SmartFM
Implementation Repository for SmartFM system designed by Group 4 for SWE30003.


# SmartFM - Smart Fleet Management System (Frontend)

This repository contains the Frontend application for SmartFM (Smart Fleet Management System), an enterprise-grade logistics and fleet coordination platform built for ABC-Trans. 

This project is developed as part of Assignment 3 (Design Implementation & Reflection) for SWE30003 - Software Architectures and Design at Swinburne University of Technology.

---

## Project Overview

The SmartFM Frontend provides an intuitive, responsive, and role-based user interface designed to streamline logistics operations across multiple actors:
* Customers: Browse service offerings, place shipping orders with real-time dynamic pricing, manage orders, and complete invoice payments.
* Branch Staff: Monitor incoming pending orders, assign qualified drivers and available vehicles, and automatically generate shipment dispatch records.
* Drivers: Access assigned itineraries, update real-time transit statuses (IN TRANSIT, DELIVERED, DELAYED), and log localized tracking records with operational notes.

---

## Tech Stack & Dependencies

* Core Framework: React.js / Next.js / React Native (or Vite + React)
* Language: TypeScript / JavaScript (ES6+)
* Styling & UI Components: Tailwind CSS / CSS Modules / Styled Components
* State Management & Data Fetching: Axios / Fetch API / React Context API / Redux Toolkit
* Icons & Assets: Lucide React / React Icons

---

## Architecture & Key Design Patterns

The Frontend implementation reflects the Object-Oriented Architecture established in the design specification:

1. Role-Based Access Control (RBAC):
   * Implements dynamic UI rendering based on the authenticated user's role (Customer, Staff, Driver) derived from the abstract User class hierarchy.
2. Form Validation & Real-Time UX:
   * Login Validation: Regex email formatting and password constraint checks[cite: 1, 2].
   * Cargo & Order Validation: Positive numeric checks for cargo weight/dimensions (> 0), required non-empty address fields, and automatic dynamic price calculation.
   * Tracking Log Validation: Mandatory location text entry and enforced sequential status transitions (ASSIGNED -> IN TRANSIT -> DELIVERED).
3. Decoupled API Integration:
   * Utilizes clean API service layers to interact with backend controllers (OrderManager, FleetManager).

---

## Getting Started

### Prerequisites

Ensure you have the following installed on your local environment:
* Node.js: v18.x or higher[cite: 1]
* Package Manager: npm (v9+) or yarn / pnpm

