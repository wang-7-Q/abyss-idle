import { SKILL_DEFINITIONS, getSkillUpgradeCost } from '../../game/skills';
import { useGameStore } from '../../store/gameStore';
import { Panel } from '../shared/Panel';

export function SkillsView() {
  const skills = useGameStore((state) => state.game.skills);
  const upgradeSkill = useGameStore((state) => state.upgradeSkill);

  return (
    <Panel title="主动技能">
      {Object.values(skills).map((skill) => {
        const definition = SKILL_DEFINITIONS[skill.id];
        return (
          <button
            className="item-row"
            key={skill.id}
            type="button"
            onClick={() => upgradeSkill(skill.id, Date.now())}
          >
            <span>{definition.name}</span>
            <strong>等级 {skill.level}</strong>
            <em>{getSkillUpgradeCost(skill)} 金币</em>
          </button>
        );
      })}
    </Panel>
  );
}
