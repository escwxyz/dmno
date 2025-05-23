import { expect, test, describe } from 'vitest';
import * as _ from 'lodash-es';
import {
  Configraph, ConfigraphEntity, ConfigraphNode,
} from '@dmno/configraph';

describe('graph entities', () => {
  describe('entity metadata', () => {
    test('entities can have additional domain-specific metadata', () => {
      // TODO: will try to extract this type info from the schema passed in
      type CustomEntityMetadata = {
        requiredMetadata: string,
        optionalMetadata?: string
      };
      const g = new Configraph<CustomEntityMetadata>();
      const root = g.addEntity({
        id: 'root',
        requiredMetadata: 'root-required',
        optionalMetadata: 'root-optional',
      });
      expect(root.getMetadata('requiredMetadata', { inheritable: true })).toBe('root-required');
      expect(root.getMetadata('optionalMetadata', { inheritable: true })).toBe('root-optional');


      const child = g.addEntity({
        requiredMetadata: 'child-required',
        // optionalMetadata will be inherited from parent
      });
      expect(child.getMetadata('requiredMetadata', { inheritable: true })).toBe('child-required');
      expect(child.getMetadata('optionalMetadata', { inheritable: true })).toBe('root-optional');

      // TODO: also need to check how metadata is inherited via templates as well
    });
  });

  describe('metadata v2', () => {
    test('using a custom child class to define shape of metadata', async () => {
      class CustomConfigraph extends Configraph {}

      type CustomNodeMetadata = {
        nodeExtra?: string,
      };

      class CustomConfigraphNode extends ConfigraphNode<CustomNodeMetadata> {
        toJSON() {
          return {
            ...super.toCoreJSON(),
            nodeExtra: this.type.getMetadata('nodeExtra'),
          };
        }
      }

      type CustomEntityMetadata = {
        entityExtra: string;
      };
      class CustomConfigraphEntity extends ConfigraphEntity<
      CustomEntityMetadata, CustomNodeMetadata, CustomConfigraphNode
      > {
        NodeClass = CustomConfigraphNode;

        get entityExtra() { return this.getMetadata('entityExtra'); }

        toJSON() {
          return {
            ...super.toCoreJSON(),
            entityExtra: this.entityExtra,
            configNodes: _.mapValues(this.configNodes, (item, _key) => item.toJSON()),
          };
        }
      }

      const g = new CustomConfigraph();
      const e = new CustomConfigraphEntity(g, {
        entityExtra: 'entity-metadata',
        configSchema: {
          c1: { nodeExtra: 'node-metadata' },
          c2: {},
        },
      });
      await g.resolveConfig();
      const entityJson = e.toJSON();
      expect(entityJson.entityExtra).toBe('entity-metadata');
      expect(entityJson.configNodes.c1.nodeExtra).toBe('node-metadata');
      expect(entityJson.configNodes.c2.nodeExtra).toBeUndefined();
    });
  });
});
