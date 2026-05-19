/**
 * Centralized Image Assets
 * 
 * All images used in the application are imported and exported from here.
 * This makes it easy to:
 * - Replace images for final submission
 * - Track which images are used where
 * - Ensure consistent image usage
 */

// Import local image files
import heroElectricianImg from './hero page.webp'
import servicePlumbingImg from './plumbing.jpg'
import serviceElectricianImg from './electrician.jpg'
import serviceAcRepairImg from './Ac-repair.jpg'
import serviceHandymanImg from './handyman.png'
import serviceCarpenterImg from './carpenter.png'
import servicePainterImg from './painter.png'
import serviceCleaningImg from './cleaning service.png'
import serviceGeneratorImg from './generator-repair.png'
import serviceApplianceImg from './appliance-care.png'
import serviceItSupportImg from './it-support.png'
import serviceCctvImg from './cctv-installation.png'
import serviceSmartHomeImg from './smart home setup.png'
import sectionRepairMaintenanceImg from './repair and maintenance.png'
// Solution-specific images
import solutionSmartVendorImg from './smart vendor manage.png'
import solutionEscrowImg from './escrow.png'
import solutionGeoFencingImg from './geo-fencing.png'
import solutionAnonymousChatImg from './anonymous chat.png'

// Image mapping - Using local images where available, URLs as fallback
const imageMap = {
  // ============================================
  // HERO IMAGE - Using local image file
  // ============================================
  heroElectrician: heroElectricianImg,
  
  // Service Images (Most Used) - Using local images where available
  servicePlumbing: servicePlumbingImg,
  serviceElectrician: serviceElectricianImg,
  serviceAcRepair: serviceAcRepairImg,
  serviceHandyman: serviceHandymanImg,
  serviceCarpenter: serviceCarpenterImg,
  servicePainter: servicePainterImg,
  serviceCleaning: serviceCleaningImg,
  serviceGenerator: serviceGeneratorImg,
  serviceAppliance: serviceApplianceImg,
  serviceItSupport: serviceItSupportImg,
  serviceCctv: serviceCctvImg,
  serviceSmartHome: serviceSmartHomeImg,
  
  // Section Images
  sectionHomeServices: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&q=80', // TODO: Add local image
  sectionRepairMaintenance: sectionRepairMaintenanceImg,
  sectionProfessionalServices: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&q=80', // TODO: Add local image
  
  // Solutions - Specific images for each solution feature
  solutionSmartVendor: solutionSmartVendorImg,
  solutionEscrow: solutionEscrowImg,
  solutionGeoFencing: solutionGeoFencingImg,
  solutionAnonymousChat: solutionAnonymousChatImg,
  // Fallback for generic solution feature
  solutionFeature: solutionSmartVendorImg,
  
  // Support - Four specific category images
  // TODO: Replace these URLs with local imports when images are added to support/ folder
  // Example: import supportProductHelpImg from './support/support-product-help.jpg'
  supportProductHelp: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80', // software help, technical support
  supportVendors: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80', // technician working, service provider
  supportAccountAccess: 'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=600&q=80', // login security, account access
  supportPayments: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80', // online payment, digital transaction
  // Legacy support images (kept for backward compatibility)
  supportCategory: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&q=80',
  supportTeam: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=80',
  
  // Dashboard Images
  adminPlatformOverview: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
  
  // Complaint & Job Images
  complaintProblem: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&q=80',
  jobDetail: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&q=80',
  jobProofPlaceholder: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&q=80',
  avatarPlaceholder: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
}

// Export all images
export const {
  heroElectrician,
  servicePlumbing,
  serviceElectrician,
  serviceAcRepair,
  serviceHandyman,
  serviceCarpenter,
  servicePainter,
  serviceCleaning,
  serviceGenerator,
  serviceAppliance,
  serviceItSupport,
  serviceCctv,
  serviceSmartHome,
  sectionHomeServices,
  sectionRepairMaintenance,
  sectionProfessionalServices,
  solutionSmartVendor,
  solutionEscrow,
  solutionGeoFencing,
  solutionAnonymousChat,
  solutionFeature,
  supportProductHelp,
  supportVendors,
  supportAccountAccess,
  supportPayments,
  supportCategory,
  supportTeam,
  adminPlatformOverview,
  complaintProblem,
  jobDetail,
  jobProofPlaceholder,
  avatarPlaceholder,
} = imageMap

/**
 * Avatar URL generator
 * Generates avatar URLs for users
 */
export const getAvatarUrl = (email, size = 150) => {
  if (!email) return avatarPlaceholder
  return `https://i.pravatar.cc/${size}?u=${email}`
}

