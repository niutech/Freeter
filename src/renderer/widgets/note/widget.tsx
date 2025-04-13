/*
 * Copyright: (c) 2024, Alex Kaul
 * GNU General Public License v3.0 or later (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { debounce } from '@/widgets/helpers';
import { ReactComponent, WidgetReactComponentProps } from '@/widgets/appModules';
import * as styles from './widget.module.scss';
import { Settings } from './settings';
import { ChangeEventHandler, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createContextMenuFactory, textAreaContextId } from '@/widgets/note/contextMenu';
import { createActionBarItems } from '@/widgets/note/actionBar';
import { Editor } from 'tiny-markdown-editor';
import 'tiny-markdown-editor/dist/tiny-mde.min.css';

const keyNote = 'note';

function WidgetComp({widgetApi, settings}: WidgetReactComponentProps<Settings>) {
  const {updateActionBar, setContextMenuFactory, dataStorage} = widgetApi;
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const loadedNote = useRef('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      updateActionBar(createActionBarItems(textAreaRef.current, widgetApi));
      setContextMenuFactory(createContextMenuFactory(textAreaRef.current, widgetApi));
    }
  }, [isLoaded, updateActionBar, setContextMenuFactory, widgetApi]);

  const saveNote = useMemo(() => debounce((note: string) => dataStorage.setText(keyNote, note), 3000), [dataStorage]);

  const loadNote = useCallback(async function () {
    loadedNote.current = await dataStorage.getText(keyNote) || '';
    setIsLoaded(true);
  }, [dataStorage]);

  const handleChange = useCallback<ChangeEventHandler<HTMLTextAreaElement>>((e) => {
    const newNote = e.target.value;
    saveNote(newNote)
  }, [saveNote])

  useEffect(() => {
    loadNote();
  }, [loadNote])

  useEffect(() => {
    if (settings.markdown && textAreaRef.current) {
      const tinyMDE = new Editor({textarea: textAreaRef.current});
      tinyMDE.addEventListener('change', (e) => saveNote(e.content));
      (textAreaRef.current.nextSibling as HTMLElement).spellcheck = settings.spellCheck;
    }
  })

  return (
    isLoaded
    ? <textarea
        ref={textAreaRef}
        className={styles['textarea']}
        defaultValue={loadedNote.current}
        onChange={handleChange}
        placeholder='Write a note here'
        data-widget-context={textAreaContextId}
        spellCheck={settings.spellCheck}
      ></textarea>
    : <>Loading Note...</>
  )
}

export const widgetComp: ReactComponent<WidgetReactComponentProps<Settings>> = {
  type: 'react',
  Comp: WidgetComp
}
