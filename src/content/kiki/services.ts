import type { ServiceCategory } from '@prisma/client';

export interface ServiceSeed {
  slug: string;
  nameEn: string;
  nameZh: string;
  descriptionEn: string;
  descriptionZh: string;
  category: ServiceCategory;
  priceMyrCents: number;
  durationMin: number;
  sortOrder: number;
}

export const serviceSeeds: ServiceSeed[] = [
  {
    slug: 'bridal-standard',
    nameEn: 'Bridal Makeup — Standard',
    nameZh: '新娘妆 — 标准',
    descriptionEn: 'Full bridal makeup with natural Korean aesthetic. Includes trial session at studio.',
    descriptionZh: '韩式自然风格新娘妆,包含一次试妆。',
    category: 'bridal',
    priceMyrCents: 80000,
    durationMin: 180,
    sortOrder: 10,
  },
  {
    slug: 'bridal-premium',
    nameEn: 'Bridal Makeup — Premium',
    nameZh: '新娘妆 — 高级',
    descriptionEn: 'Premium bridal package with two looks, on-site touch-ups, and trial.',
    descriptionZh: '高级新娘妆,两款造型加现场补妆与试妆。',
    category: 'bridal',
    priceMyrCents: 120000,
    durationMin: 240,
    sortOrder: 20,
  },
  {
    slug: 'party-glam',
    nameEn: 'Party / Event Makeup',
    nameZh: '派对妆',
    descriptionEn: 'Evening or event makeup, done at studio or on-site.',
    descriptionZh: '派对或活动妆容,可至工作室或上门服务。',
    category: 'party',
    priceMyrCents: 25000,
    durationMin: 75,
    sortOrder: 30,
  },
  {
    slug: 'halal-bridal',
    nameEn: 'Halal Bridal Makeup',
    nameZh: '清真新娘妆',
    descriptionEn: 'Halal-certified product set for Muslim brides.',
    descriptionZh: '使用清真认证化妆品,专为穆斯林新娘设计。',
    category: 'halal',
    priceMyrCents: 90000,
    durationMin: 180,
    sortOrder: 40,
  },
  {
    slug: 'photoshoot',
    nameEn: 'Photoshoot Makeup',
    nameZh: '写真妆',
    descriptionEn: 'Commercial or personal photoshoot makeup, camera-ready.',
    descriptionZh: '商业或个人写真妆,适合镜头拍摄。',
    category: 'photoshoot',
    priceMyrCents: 30000,
    durationMin: 90,
    sortOrder: 50,
  },
];
