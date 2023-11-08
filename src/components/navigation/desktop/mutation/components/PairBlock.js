import React, { useEffect, useState } from "react";
import { Trash } from "../assets/icons/Trash";
import { ArrowRight } from "../assets/icons/ArrowRight";
import { AddGrayIcon } from "../../../../icons/AddGrayIcon";
import styles from "./PairBlock.module.scss";
import cn from "classnames";
import { SearchComponentInput } from "./SearchComponentInput";
import { v4 as uuid } from "uuid";

export function PairBlock({ override, onChange, onRemove }) {
  const [sourceComponentId, setSourceComponentId] = useState(override.from);
  const [targetComponents, setTargetComponents] = useState([]);

  useEffect(() => {
    const targetComponentIds = Array.isArray(override.to)
      ? override.to
      : [override.to];
    const targetComponents = targetComponentIds.map((id) => ({
      key: uuid(),
      id,
    }));
    setTargetComponents(targetComponents);
  }, []);

  const handleSourceChange = (componentId) => {
    setSourceComponentId(componentId);
    onChange({
      id: override.id,
      from: componentId,
      to: targetComponents.map((comp) => comp.id),
    });
  };

  const handleTargetChange = (componentId, key) => {
    setTargetComponents((comps) => {
      const clone = JSON.parse(JSON.stringify(comps));
      clone[clone.findIndex((comp) => comp.key === key)] = {
        key,
        id: componentId,
      };
      onChange({
        id: override.id,
        from: sourceComponentId,
        to: clone.map((comp) => comp.id),
      });
      return clone;
    });
  };

  const handleAddTargetComponent = () => {
    setTargetComponents((comps) => [...comps, { key: uuid(), id: null }]);
  };

  return (
    <div className={cn(styles.wrapper)}>
      <div onClick={onRemove} className={cn(styles.pairRemove)}>
        <Trash />
      </div>
      <div className={cn(styles.rubberBlock)}>
        <SearchComponentInput
          value={sourceComponentId}
          placeholder="Source Widget ID"
          onChange={handleSourceChange}
        />
      </div>
      <div className={cn(styles.pairArrow)}>
        <ArrowRight />
      </div>
      <div className={cn(styles.rubberBlock)}>
        {targetComponents.map((comp, index) => (
          <SearchComponentInput
            key={comp.key}
            value={comp.id}
            placeholder="Target Widget ID"
            onChange={(componentId) =>
              handleTargetChange(componentId, comp.key)
            }
            isInputButton={true}
            isAdditional={index > 0}
          />
        ))}
      </div>
      <div
        onClick={() => handleAddTargetComponent()}
        className={cn(styles.pairRemove, {
          [styles.addAdditional]: targetComponents.length > 1,
        })}
      >
        <AddGrayIcon />
      </div>
    </div>
  );
}
