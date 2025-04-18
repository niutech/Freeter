/*
 * Copyright: (c) 2024, Alex Kaul
 * GNU General Public License v3.0 or later (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { MemSaverConfigApp } from '@/base/memSaver';

export interface AppConfig {
  mainHotkey: string;
  memSaver: MemSaverConfigApp;
  uiTheme: string;
}
