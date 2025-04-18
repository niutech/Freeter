/*
 * Copyright: (c) 2024, Alex Kaul
 * GNU General Public License v3.0 or later (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { createSaveWorkflowSettingsUseCase } from '@/application/useCases/workflowSettings/saveWorkflowSettings';
import { AppState } from '@/base/state/app';
import { fixtureWorkflowA, fixtureWorkflowSettingsA } from '@tests/base/fixtures/workflow';
import { fixtureAppState } from '@tests/base/state/fixtures/appState';
import { fixtureModalScreens, fixtureModalScreensData } from '@tests/base/state/fixtures/modalScreens';
import { fixtureWorkflowSettings } from '@tests/base/state/fixtures/workflowSettings';
import { fixtureAppStore } from '@tests/data/fixtures/appStore';

async function setup(initState: AppState) {
  const [appStore] = await fixtureAppStore(initState);
  const saveWorkflowSettingsUseCase = createSaveWorkflowSettingsUseCase({
    appStore
  });
  return {
    appStore,
    saveWorkflowSettingsUseCase
  }
}

describe('saveWorkflowSettingsUseCase()', () => {
  it('should do nothing, if workflow is null', async () => {
    const workflow = fixtureWorkflowA();
    const initState = fixtureAppState({
      entities: {
        workflows: {
          [workflow.id]: workflow
        }
      },
      ui: {
        modalScreens: fixtureModalScreens({
          data: fixtureModalScreensData({
            workflowSettings: fixtureWorkflowSettings({
              workflow: null
            })
          }),
          order: ['about', 'workflowSettings']
        })
      }
    })
    const {
      appStore,
      saveWorkflowSettingsUseCase
    } = await setup(initState)

    const expectState = appStore.get();
    saveWorkflowSettingsUseCase();

    expect(appStore.get()).toBe(expectState);
  })

  it('should save the settings to Workflows state and reset Workflow Settings state', async () => {
    const workflow = fixtureWorkflowA({
      settings: fixtureWorkflowSettingsA({
        name: 'Name'
      })
    });
    const workflowWithNewSettings: typeof workflow = {
      ...workflow,
      settings: {
        ...workflow.settings,
        name: 'New Name'
      }
    }
    const initState = fixtureAppState({
      entities: {
        workflows: {
          [workflow.id]: workflow
        }
      },
      ui: {
        modalScreens: fixtureModalScreens({
          data: fixtureModalScreensData({
            workflowSettings: fixtureWorkflowSettings({
              workflow: workflowWithNewSettings,
            })
          }),
          order: ['about', 'workflowSettings']
        })
      }
    })
    const expectState: AppState = {
      ...initState,
      entities: {
        ...initState.entities,
        workflows: {
          ...initState.entities.workflows,
          [workflow.id]: {
            ...initState.entities.workflows[workflow.id]!,
            settings: workflowWithNewSettings.settings,
          }
        }
      },
      ui: {
        ...initState.ui,
        modalScreens: {
          ...initState.ui.modalScreens,
          data: {
            ...initState.ui.modalScreens.data,
            workflowSettings: {
              ...initState.ui.modalScreens.data.workflowSettings,
              workflow: null
            }
          },
          order: ['about']
        }
      }
    }
    const {
      appStore,
      saveWorkflowSettingsUseCase
    } = await setup(initState)

    saveWorkflowSettingsUseCase();

    const newState = appStore.get();
    expect(newState).toEqual(expectState);
  })
})
