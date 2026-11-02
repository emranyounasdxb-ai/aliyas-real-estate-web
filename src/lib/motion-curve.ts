import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(CustomEase);
export const brandEase = CustomEase.create('aliyas-weighted', '0.22,1,0.36,1');
