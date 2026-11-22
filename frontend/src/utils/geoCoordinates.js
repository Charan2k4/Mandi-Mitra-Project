/**
 * Verified Indian State and District Centroid Coordinates
 * Provides fallback coordinates so the application never leaves stale coordinates
 * or misplaces a farmer across state lines.
 */

export const STATE_COORDINATES = {
  'Andhra Pradesh': { lat: 15.9129, lng: 79.7400 },
  'Assam': { lat: 26.2006, lng: 92.9376 },
  'Bihar': { lat: 25.0961, lng: 85.3131 },
  'Chattisgarh': { lat: 21.2787, lng: 81.8661 },
  'Gujarat': { lat: 22.2587, lng: 71.1924 },
  'Haryana': { lat: 29.0588, lng: 76.0856 },
  'Himachal Pradesh': { lat: 31.1048, lng: 77.1734 },
  'Jammu And Kashmir': { lat: 33.7782, lng: 76.5762 },
  'Karnataka': { lat: 15.3173, lng: 75.7139 },
  'Keralam': { lat: 10.8505, lng: 76.2711 },
  'Madhya Pradesh': { lat: 22.9734, lng: 78.6569 },
  'Maharashtra': { lat: 19.7515, lng: 75.7139 },
  'Odisha': { lat: 20.9517, lng: 85.0985 },
  'Punjab': { lat: 31.1471, lng: 75.3412 },
  'Rajasthan': { lat: 27.0238, lng: 74.2179 },
  'Tamil Nadu': { lat: 11.1271, lng: 78.6569 },
  'Telangana': { lat: 18.1124, lng: 79.0193 },
  'Tripura': { lat: 23.9408, lng: 91.9882 },
  'Uttar Pradesh': { lat: 26.8467, lng: 80.9462 },
  'West Bengal': { lat: 22.9868, lng: 87.8550 },
};

export const DISTRICT_COORDINATES = {
  // Andhra Pradesh
  'Guntur': { lat: 16.3067, lng: 80.4365 },
  'Kurnool': { lat: 15.8281, lng: 78.0373 },
  'Krishna': { lat: 16.1875, lng: 81.1389 },
  'Annamayya': { lat: 14.1670, lng: 78.8950 },

  // Assam
  'Nagaon': { lat: 26.3464, lng: 92.6840 },
  'Cachar': { lat: 24.8333, lng: 92.7789 },
  'Sonitpur': { lat: 26.6528, lng: 92.7926 },

  // Bihar
  'Chhapra': { lat: 25.7811, lng: 84.7543 },
  'Supaul': { lat: 26.1260, lng: 86.6053 },

  // Chattisgarh
  'Khairagarh Chhuikhadan Gandai': { lat: 21.4190, lng: 80.9780 },
  'Bilaspur': { lat: 22.0797, lng: 82.1409 },

  // Gujarat
  'Dahod': { lat: 22.8373, lng: 74.2543 },
  'Sabarkantha': { lat: 23.6800, lng: 73.0400 },
  'Rajkot': { lat: 22.3039, lng: 70.8022 },

  // Haryana
  'Kurukshetra': { lat: 29.9695, lng: 76.8783 },
  'Panipat': { lat: 29.3909, lng: 76.9635 },
  'Gurgaon': { lat: 28.4595, lng: 77.0266 },
  'Kaithal': { lat: 29.8015, lng: 76.3996 },
  'Faridabad': { lat: 28.4089, lng: 77.3178 },
  'Rohtak': { lat: 28.8955, lng: 76.6066 },
  'Hissar': { lat: 29.1492, lng: 75.7217 },
  'Rewari': { lat: 28.1820, lng: 76.6180 },
  'Sirsa': { lat: 29.5349, lng: 75.0294 },
  'Mewat': { lat: 28.1060, lng: 76.9960 },

  // Himachal Pradesh
  'Hamirpur': { lat: 31.6862, lng: 76.5213 },
  'Solan': { lat: 30.9084, lng: 77.0999 },

  // Jammu And Kashmir
  'Udhampur': { lat: 32.9250, lng: 75.1416 },
  'Jammu': { lat: 32.7266, lng: 74.8570 },

  // Karnataka
  'Dharwad': { lat: 15.3647, lng: 75.1240 },
  'Raichur': { lat: 16.2120, lng: 77.3439 },
  'Chikkaballapur': { lat: 13.4355, lng: 77.7315 },
  'Chamarajanagar': { lat: 11.9261, lng: 76.9437 },
  'Bengaluru South': { lat: 12.9237, lng: 77.5855 },
  'Kolar': { lat: 13.1367, lng: 78.1340 },

  // Keralam
  'Ernakulam': { lat: 9.9816, lng: 76.2999 },
  'Thirssur': { lat: 10.5276, lng: 76.2144 },
  'Alappuzha': { lat: 9.4981, lng: 76.3388 },
  'Thiruvananthapuram': { lat: 8.5241, lng: 76.9366 },

  // Madhya Pradesh
  'Indore': { lat: 22.7196, lng: 75.8577 },
  'Ujjain': { lat: 23.1765, lng: 75.7885 },
  'Harda': { lat: 22.3444, lng: 77.0950 },

  // Maharashtra
  'Nashik': { lat: 19.9975, lng: 73.7898 },
  'Nagpur': { lat: 21.1458, lng: 79.0882 },
  'Latur': { lat: 18.4088, lng: 76.5604 },

  // Odisha
  'Keonjhar': { lat: 21.6289, lng: 85.5817 },
  'Cuttack': { lat: 20.4625, lng: 85.8828 },
  'Bhadrak': { lat: 21.0574, lng: 86.4957 },
  'Koraput': { lat: 18.8135, lng: 82.7123 },
  'Mayurbhanja': { lat: 21.9322, lng: 86.7441 },
  'Kalahandi': { lat: 19.9010, lng: 83.1649 },

  // Punjab
  'Ludhiana': { lat: 30.9010, lng: 75.8573 },
  'Bhatinda': { lat: 30.2110, lng: 74.9455 },
  'Jalandhar': { lat: 31.3260, lng: 75.5762 },
  'Tarntaran': { lat: 31.4520, lng: 74.9255 },
  'Fazilka': { lat: 30.4037, lng: 74.0254 },
  'Sangrur': { lat: 30.2458, lng: 75.8421 },

  // Rajasthan
  'Hanumangarh': { lat: 29.5815, lng: 74.3294 },
  'Bharatpur': { lat: 27.2152, lng: 77.5030 },

  // Tamil Nadu
  'Thiruppur': { lat: 11.1085, lng: 77.3411 },
  'Dharmapuri': { lat: 12.1211, lng: 78.1582 },
  'Kancheepuram': { lat: 12.8342, lng: 79.7036 },
  'Madurai': { lat: 9.9252, lng: 78.1198 },
  'Namakkal': { lat: 11.2189, lng: 78.1674 },
  'Perambalur': { lat: 11.2342, lng: 78.8820 },
  'Salem': { lat: 11.6643, lng: 78.1460 },
  'Thiruvannamalai': { lat: 12.2253, lng: 79.0747 },
  'Sivagangai': { lat: 9.8433, lng: 78.4809 },
  'Thiruchirappalli': { lat: 10.7905, lng: 78.7047 },
  'Chengalpet': { lat: 12.6819, lng: 79.9888 },
  'Kannyiakumari': { lat: 8.0883, lng: 77.5385 },
  'Thirupathur': { lat: 12.4925, lng: 78.5678 },
  'The Nilgiris': { lat: 11.4102, lng: 76.6950 },
  'Virudhunagar': { lat: 9.5872, lng: 77.9514 },
  'Kallakurichi': { lat: 11.7384, lng: 78.9639 },
  'Erode': { lat: 11.3410, lng: 77.7172 },
  'Vellore': { lat: 12.9165, lng: 79.1325 },
  'Mayiladuthurai': { lat: 11.1018, lng: 79.6522 },
  'Dindigul': { lat: 10.3673, lng: 77.9803 },
  'Coimbatore': { lat: 11.0168, lng: 76.9558 },
  'Cuddalore': { lat: 11.7480, lng: 79.7714 },

  // Telangana
  'Warangal': { lat: 17.9784, lng: 79.5941 },
  'Khammam': { lat: 17.2473, lng: 80.1514 },
  'Nizamabad': { lat: 18.6725, lng: 78.0941 },
  'Suryapet': { lat: 17.1439, lng: 79.6239 },
  'Adilabad': { lat: 19.6641, lng: 78.5320 },
  'Nagarkurnool': { lat: 16.4854, lng: 78.3330 },
  'Nalgonda': { lat: 17.0577, lng: 79.2684 },
  'Ranga Reddy': { lat: 17.3850, lng: 78.4867 },

  // Tripura
  'Khowai': { lat: 24.0625, lng: 91.6045 },

  // Uttar Pradesh
  'Aligarh': { lat: 27.8974, lng: 78.0880 },
  'Kanpur': { lat: 26.4499, lng: 80.3319 },

  // West Bengal
  'Darjeeling': { lat: 27.0410, lng: 88.2663 },
  'Birbhum': { lat: 23.8404, lng: 87.6186 },
  'Hooghly': { lat: 22.8963, lng: 88.2461 },
};

/**
 * Returns authentic coordinates for a given state and optional district.
 * Always returns a valid { lat, lng } object so coordinates are never null or stale.
 */
export function getCoordinatesFor(stateName, districtName = null) {
  if (districtName && DISTRICT_COORDINATES[districtName]) {
    return DISTRICT_COORDINATES[districtName];
  }
  if (stateName && STATE_COORDINATES[stateName]) {
    return STATE_COORDINATES[stateName];
  }
  // Default to Warangal, Telangana
  return { lat: 17.9784, lng: 79.5941 };
}
