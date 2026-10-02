import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Phone, MapPin, AlertTriangle, X, ShieldAlert, Navigation, Hospital, Droplet, Flame, Shield, Truck } from "lucide-react";
import { toast } from "sonner";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "../../firebase";

interface EmergencyContact {
  id: string;
  type: string;
  name: string;
  phone: string;
  location?: string;
  lat?: number;
  lng?: number;
  verified: boolean;
}

export function EmergencyOneTap() {
  return null;
}
