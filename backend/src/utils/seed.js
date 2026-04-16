const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const EscrowPayment = require('../models/EscrowPayment');
const Order = require('../models/Order');

dotenv.config();
const run = async () => {
  try {
    await connectDB();
    // clear
    await Promise.all([User.deleteMany(), Service.deleteMany(), Booking.deleteMany(), EscrowPayment.deleteMany(), Order.deleteMany()]);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@resolveit.com',
      password: 'password',
      role: 'admin',
      phone: '03000000000',
      city: 'Lahore',
      address: 'Admin Office',
      postalCode: '54000',
    });

    const vendor = await User.create({
      name: 'Vendor One',
      email: 'vendor@resolveit.com',
      password: 'password',
      role: 'vendor',
      phone: '03110000000',
      city: 'Lahore',
      address: 'Vendor Street 3',
      postalCode: '54010',
    });

    const customer = await User.create({
      name: 'Customer One',
      email: 'customer@resolveit.com',
      password: 'password',
      role: 'customer',
      phone: '03220000000',
      city: 'Lahore',
      address: 'Customer Road 5',
      postalCode: '54020',
    });

    const s1 = await Service.create({
      name: 'Plumbing Repair',
      description: 'Fix leaks, replace pipes, and stop clogs quickly.',
      image: '',
      basePrice: 5000,
      category: 'plumbing',
    });
    const s2 = await Service.create({
      name: 'AC Maintenance',
      description: 'Clean filters, test cooling systems, and restore comfort.',
      image: '',
      basePrice: 12000,
      category: 'ac',
    });
    const s3 = await Service.create({
      name: 'Electrician Services',
      description: 'Electrical repairs, wiring, and installation services.',
      image: '',
      basePrice: 6000,
      category: 'electrical',
    });
    const s4 = await Service.create({
      name: 'Carpentry & Woodwork',
      description: 'Custom carpentry, furniture repair, and installations.',
      image: '',
      basePrice: 8000,
      category: 'carpentry',
    });
    const s5 = await Service.create({
      name: 'House Painting',
      description: 'Interior and exterior painting services with quality finishes.',
      image: '',
      basePrice: 10000,
      category: 'painting',
    });
    const s6 = await Service.create({
      name: 'House Cleaning',
      description: 'Professional deep cleaning and maintenance services.',
      image: '',
      basePrice: 4000,
      category: 'cleaning',
    });
    const s7 = await Service.create({
      name: 'Pest Control',
      description: 'Safe and effective pest control and fumigation services.',
      image: '',
      basePrice: 7000,
      category: 'pest_control',
    });
    const s8 = await Service.create({
      name: 'Lock & Door Repair',
      description: 'Lock repair, replacement, and door maintenance services.',
      image: '',
      basePrice: 3000,
      category: 'locks',
    });
    const s9 = await Service.create({
      name: 'Furniture Assembly',
      description: 'Professional assembly and installation of furniture.',
      image: '',
      basePrice: 3500,
      category: 'furniture',
    });
    const s10 = await Service.create({
      name: 'Appliance Repair',
      description: 'Refrigerator, washing machine, and appliance repairs.',
      image: '',
      basePrice: 5500,
      category: 'appliances',
    });

    await Order.create({
      userId: customer._id,
      vendorId: vendor._id,
      serviceId: s1._id,
      city: 'Lahore',
      address: '123 Customer Lane',
      date: new Date(Date.now() + 86400000),
      status: 'pending',
      amount: s1.basePrice,
    });

    const booking = await Booking.create({ customerId: customer._id, vendorId: vendor._id, serviceId: s1._id, bookingDate: new Date(), timeSlot: '10:00-11:00', escrowAmount: s1.basePrice });
    await EscrowPayment.create({ bookingId: booking._id, customerId: customer._id, vendorId: vendor._id, amount: s1.basePrice, status: 'held' });

    console.log('Seed complete. Users: ', { admin: admin.email, vendor: vendor.email, customer: customer.email });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
