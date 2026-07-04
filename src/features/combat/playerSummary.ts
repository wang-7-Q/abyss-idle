import { calculateExperienceForLevel } from '../../game/formulas';

interface ExperienceProgressInput {
  level: number;
  experience: number;
}

interface ExperienceProgress {
  current: number;
  required: number;
  percent: number;
}

export function getExperienceProgress(input: ExperienceProgressInput): ExperienceProgress {
  const level = Math.max(1, Math.floor(input.level));
  const required = calculateExperienceForLevel(level);
  const current = Math.min(required, Math.max(0, Math.floor(input.experience)));
  const percent = Math.round((current / required) * 100);

  return { current, required, percent };
}
