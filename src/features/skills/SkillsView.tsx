import { SKILL_DEFINITIONS, getSkillUpgradeCost } from '../../game/skills';
import { useGameStore } from '../../store/gameStore';
import { Panel } from '../shared/Panel';

export function SkillsView() {
  const skills = useGameStore((state) => state.game.skills);

  return (
    <Panel title="主动技能">
      {Object.values(skills).map((skill) => {
        const definition = SKILL_DEFINITIONS[skill.id];
        return (
          <div className="item-row" key={skill.id}>
            <span>{definition.name}</span>
            <strong>等级 {skill.level}</strong>
            <em>{getSkillUpgradeCost(skill)} 金币</em>
          </div>
        );
      })}
    </Panel>
  );
}
