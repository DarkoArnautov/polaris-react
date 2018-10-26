import * as React from 'react';
import {noop} from '@shopify/javascript-utilities/other';
import {mountWithAppProvider, trigger} from 'test-utilities';
import ComboBox from '..';
import ActionList from '../../../../ActionList';
import Popover from '../../../../Popover';
import OptionList, {OptionDescriptor} from '../../../../OptionList';
import {TextField} from '../components';
import {Key} from '../../../../../types';

interface HandlerMap {
  [eventName: string]: (event: any) => void;
}

const listenerMap: HandlerMap = {};

describe('<ComboBox/>', () => {
  let addEventListener: jest.SpyInstance;
  let removeEventListener: jest.SpyInstance;

  beforeEach(() => {
    addEventListener = jest.spyOn(document, 'addEventListener');
    addEventListener.mockImplementation((event, callback) => {
      listenerMap[event] = callback;
    });

    removeEventListener = jest.spyOn(document, 'removeEventListener');
    removeEventListener.mockImplementation((event) => {
      listenerMap[event] = noop;
    });
  });

  afterEach(() => {
    if (document.activeElement) {
      (document.activeElement as HTMLElement).blur();
    }

    addEventListener.mockRestore();
    removeEventListener.mockRestore();
  });

  const options = [
    {value: 'cheese_pizza', label: 'Cheese Pizza'},
    {value: 'macaroni_pizza', label: 'Macaroni Pizza'},
    {value: 'pepperoni_pizza', label: 'Pepperoni Pizza'},
  ];

  const action = [
    {
      content: 'Add tag',
      onAction: noop,
    },
  ];

  const mockProps = {
    options,
    selected: [],
    textField: renderTextField(),
    onSelect: noop,
  };

  describe('options', () => {
    it('passes options to OptionList', () => {
      const comboBox = mountWithAppProvider(<ComboBox {...mockProps} />);

      comboBox.simulate('click');

      const optionListOptions = comboBox.find(OptionList).prop('options') || [
        {
          value: '',
          label: '',
        },
      ];

      expect(optionListOptions[0].value).toBe('cheese_pizza');
      expect(optionListOptions[0].label).toBe('Cheese Pizza');
      expect(optionListOptions[1].value).toBe('macaroni_pizza');
      expect(optionListOptions[1].label).toBe('Macaroni Pizza');
    });
  });

  describe('contentBefore and contentAfter', () => {
    it('renders content passed into contentBefore', () => {
      const comboBox = mountWithAppProvider(
        <ComboBox {...mockProps} contentBefore={renderNodeWithId()} />,
      );
      comboBox.simulate('click');
      expect(comboBox.find('#CustomNode').exists()).toBe(true);
    });

    it('renders content passed into contentAfter', () => {
      const comboBox = mountWithAppProvider(
        <ComboBox {...mockProps} contentAfter={renderNodeWithId()} />,
      );
      comboBox.simulate('click');
      expect(comboBox.find('#CustomNode').exists()).toBe(true);
    });
  });

  describe('actionsBefore and actionsAfter', () => {
    const comboBox = mountWithAppProvider(
      <ComboBox
        {...mockProps}
        actionsBefore={[{image: '../image/path', role: 'option'}]}
        actionsAfter={[{image: '../image/path', role: 'option'}]}
      />,
    );

    it('passes actionsBefore to the options in the first ActionList', () => {
      comboBox.simulate('click');

      const actionListItems = comboBox
        .find(ActionList)
        .first()
        .prop('items') || [
        {
          image: '',
          role: '',
        },
      ];

      expect(actionListItems[0].image).toBe('../image/path');
      expect(actionListItems[0].role).toBe('option');
    });

    it('passes actionsAfter to the options in the second ActionList', () => {
      comboBox.simulate('click');

      const actionListItems = comboBox
        .find(ActionList)
        .last()
        .prop('items') || [
        {
          image: '',
          role: '',
        },
      ];

      expect(actionListItems[0].image).toBe('../image/path');
      expect(actionListItems[0].role).toBe('option');
    });
  });

  describe('ids', () => {
    it('passes an id to the options in OptionList', () => {
      const comboBox = mountWithAppProvider(
        <ComboBox {...mockProps} id="TestId" />,
      );
      comboBox.simulate('click');
      expect(
        comboBox
          .find('button')
          .at(0)
          .prop('id'),
      ).toBe('TestId-0');
    });

    it('passes an id to the actions in ActionList', () => {
      const comboBox = mountWithAppProvider(
        <ComboBox {...mockProps} id="TestId" actionsBefore={action} />,
      );
      comboBox.simulate('click');
      expect(
        comboBox
          .find('button')
          .at(0)
          .prop('id'),
      ).toBe('TestId-0');
    });
  });

  describe('actions', () => {
    it('renders an action in actionsBefore', () => {
      const comboBox = mountWithAppProvider(
        <ComboBox {...mockProps} actionsBefore={action} />,
      );

      comboBox.simulate('click');

      expect(
        comboBox
          .find('button')
          .at(0)
          .text(),
      ).toBe('Add tag');
    });

    it('renders an action in actionsAfter', () => {
      const comboBox = mountWithAppProvider(
        <ComboBox {...mockProps} actionsAfter={action} />,
      );
      comboBox.simulate('click');
      expect(
        comboBox
          .find('button')
          .at(3)
          .text(),
      ).toBe('Add tag');
    });
  });

  describe('select', () => {
    it('passes the selected options to OptionList', () => {
      const comboBox = mountWithAppProvider(
        <ComboBox {...mockProps} selected={['cheese_pizza']} />,
      );

      comboBox.simulate('click');
      expect(comboBox.find(OptionList).prop('selected')).toEqual([
        'cheese_pizza',
      ]);
    });
  });

  describe('listTitle', () => {
    it('passes the listTitle as title to OptionList', () => {
      const comboBox = mountWithAppProvider(
        <ComboBox {...mockProps} listTitle="List title" />,
      );

      comboBox.simulate('click');
      expect(comboBox.find(OptionList).prop('title')).toBe('List title');
    });
  });

  describe('<TextField />', () => {
    it('renders TextField by default', () => {
      const comboBox = mountWithAppProvider(<ComboBox {...mockProps} />);
      expect(comboBox.find(TextField).exists()).toBe(true);
    });

    it('renders a custom given input', () => {
      const comboBox = mountWithAppProvider(
        <ComboBox {...mockProps} textField={<input type="text" />} />,
      );
      expect(comboBox.find('input').exists()).toBe(true);
      expect(comboBox.find(TextField).exists()).toBe(false);
    });

    it('is passed to Popover as the activator', () => {
      const comboBox = mountWithAppProvider(<ComboBox {...mockProps} />);

      expect(
        comboBox
          .find(Popover)
          .find(TextField)
          .exists(),
      ).toBe(true);
    });
  });

  describe('<Popover />', () => {
    const comboBox = mountWithAppProvider(
      <ComboBox {...mockProps} preferredPosition="above" />,
    );

    it('does not set Popover to active before being clicked', () => {
      expect(comboBox.find(Popover).prop('active')).toBe(false);
    });

    it('sets Popover to active when clicked', () => {
      comboBox.simulate('click');
      expect(comboBox.find(Popover).prop('active')).toBe(true);
    });

    it('sets Popover to active on focus', () => {
      const wrapper = comboBox.find('div').first();
      trigger(wrapper, 'onFocus');
      expect(comboBox.find(Popover).prop('active')).toBe(true);
    });

    it('deactivates Popover on blur', () => {
      comboBox.simulate('click');
      const wrapper = comboBox.find('div').first();
      trigger(wrapper, 'onBlur');
      expect(comboBox.find(Popover).prop('active')).toBe(false);
    });

    it('sets Popover to fullWidth', () => {
      expect(comboBox.find(Popover).prop('fullWidth')).toBe(true);
    });

    it('prevents autofocus on Popover', () => {
      expect(comboBox.find(Popover).prop('preventAutofocus')).toBe(true);
    });

    it('passes the preferredPosition to Popover', () => {
      expect(comboBox.find(Popover).prop('preferredPosition')).toBe('above');
    });
  });

  describe('allowMultiple', () => {
    it('renders a button if the prop is false', () => {
      const comboBox = mountWithAppProvider(
        <ComboBox {...mockProps} allowMultiple={false} />,
      );
      comboBox.simulate('click');
      expect(comboBox.find('button').exists()).toBe(true);
    });

    it('renders a checkbox if the prop is set to true', () => {
      const comboBox = mountWithAppProvider(
        <ComboBox {...mockProps} allowMultiple />,
      );
      comboBox.simulate('click');
      expect(comboBox.find('input[type="checkbox"]').exists()).toBe(true);
    });
  });

  describe('onSelect', () => {
    it('gets called when an item is clicked', () => {
      const spy = jest.fn();
      const comboBox = mountWithAppProvider(
        <ComboBox {...mockProps} onSelect={spy} />,
      );
      comboBox.simulate('click');
      comboBox
        .find('button')
        .at(0)
        .simulate('click');
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('gets called when a checkbox is changed', () => {
      const spy = jest.fn();
      const comboBox = mountWithAppProvider(
        <ComboBox {...mockProps} onSelect={spy} allowMultiple />,
      );
      comboBox.simulate('click');
      comboBox
        .find('input[type="checkbox"]')
        .at(0)
        .simulate('change', {target: {checked: true}});
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('keypress events', () => {
    describe('down arrow', () => {
      it('selects nothing if there are no options', () => {
        const options: OptionDescriptor[] = [];
        const comboBox = mountWithAppProvider(
          <ComboBox {...mockProps} options={options} />,
        );

        async () => {
          comboBox.find(TextField).simulate('click');
          listenerMap.keyup({keyCode: Key.DownArrow});
          await expect(comboBox.state('selectedIndex')).toBe(-1);
        };
      });

      it('selects the first option when the down arrow is pressed', () => {
        const comboBox = mountWithAppProvider(<ComboBox {...mockProps} />);

        async () => {
          comboBox.find(TextField).simulate('click');
          listenerMap.keyup({keyCode: Key.DownArrow});
          await expect(comboBox.state('selectedIndex')).toBe(0);
        };
      });

      it('selects the first option when the down arrow is pressed from the last option', () => {
        const options = [
          {value: 'cheese_pizza', label: 'Cheese Pizza'},
          {value: 'macaroni_pizza', label: 'Macaroni Pizza'},
        ];
        const comboBox = mountWithAppProvider(
          <ComboBox {...mockProps} options={options} />,
        );

        async () => {
          comboBox.find(TextField).simulate('click');
          listenerMap.keyup({keyCode: Key.DownArrow});
          listenerMap.keyup({keyCode: Key.DownArrow});
          listenerMap.keyup({keyCode: Key.DownArrow});
          await expect(comboBox.state('selectedIndex')).toBe(0);
        };
      });

      it('calls onEndReached() when the last option is selected', () => {
        const spy = jest.fn();
        const comboBox = mountWithAppProvider(
          <ComboBox {...mockProps} onEndReached={spy} />,
        );

        async () => {
          comboBox.find(TextField).simulate('click');
          listenerMap.keyup({keyCode: Key.DownArrow});
          listenerMap.keyup({keyCode: Key.DownArrow});
          await expect(spy).toHaveBeenCalledTimes(1);
        };
      });

      it('adds to selected options when the down arrow and enter keys are pressed', () => {
        const spy = jest.fn();
        const comboBox = mountWithAppProvider(
          <ComboBox
            options={options}
            selected={[]}
            textField={renderTextField()}
            onSelect={spy}
          />,
        );

        async () => {
          comboBox.find(TextField).simulate('click');
          await listenerMap.keyup({keyCode: Key.DownArrow});
        };

        async () => {
          listenerMap.keyup({keyCode: Key.Enter});
          await expect(spy).toHaveBeenCalledTimes(1);
          expect(comboBox.prop('selected')[0]).toBe('cheese_pizza');
        };
      });
    });

    describe('up arrow', () => {
      it('selects nothing if there are no options', () => {
        const options: OptionDescriptor[] = [];
        const comboBox = mountWithAppProvider(
          <ComboBox {...mockProps} options={options} />,
        );

        async () => {
          comboBox.find(TextField).simulate('click');
          listenerMap.keyup({keyCode: Key.UpArrow});
          await expect(comboBox.state('selectedIndex')).toBe(-1);
        };
      });

      it('selects the last option when the up arrow is pressed', () => {
        const comboBox = mountWithAppProvider(<ComboBox {...mockProps} />);

        async () => {
          comboBox.find(TextField).simulate('click');
          listenerMap.keyup({keyCode: Key.UpArrow});
          await expect(comboBox.state('selectedIndex')).toBe(2);
        };
      });

      it('selects the first option when the up arrow is pressed from the second option', () => {
        const options = [
          {value: 'cheese_pizza', label: 'Cheese Pizza'},
          {value: 'macaroni_pizza', label: 'Macaroni Pizza'},
        ];
        const comboBox = mountWithAppProvider(
          <ComboBox {...mockProps} options={options} />,
        );

        async () => {
          comboBox.find(TextField).simulate('click');
          listenerMap.keyup({keyCode: Key.DownArrow});
          listenerMap.keyup({keyCode: Key.UpArrow});
          await expect(comboBox.state('selectedIndex')).toBe(0);
        };
      });

      it('calls onEndReached() when the last option is selected', () => {
        const spy = jest.fn();
        const comboBox = mountWithAppProvider(
          <ComboBox {...mockProps} onEndReached={spy} />,
        );

        async () => {
          comboBox.find(TextField).simulate('click');
          listenerMap.keyup({keyCode: Key.UpArrow});
          await expect(spy).toHaveBeenCalledTimes(1);
        };
      });

      it('adds to selected options when the up arrow and enter keys are pressed', () => {
        const spy = jest.fn();
        const comboBox = mountWithAppProvider(
          <ComboBox
            options={options}
            selected={[]}
            textField={renderTextField()}
            onSelect={spy}
          />,
        );

        async () => {
          comboBox.find(TextField).simulate('click');
          await listenerMap.keyup({keyCode: Key.UpArrow});
        };

        async () => {
          listenerMap.keyup({keyCode: Key.Enter});
          await expect(spy).toHaveBeenCalledTimes(1);
          expect(comboBox.prop('selected')[0]).toBe('pepperoni_pizza');
        };
      });
    });

    describe('tab', () => {
      it('activates the popover when the tab key is pressed', () => {
        const comboBox = mountWithAppProvider(
          <ComboBox
            options={options}
            selected={[]}
            textField={renderTextField()}
            onSelect={noop}
          />,
        );

        async () => {
          listenerMap.keyup({keyCode: Key.Tab});
          await expect(comboBox.state('popoverActive')).toBe(true);
        };
      });
    });

    describe('escape', () => {
      it('deactivates the popover when the escape key is pressed', () => {
        const comboBox = mountWithAppProvider(
          <ComboBox
            options={options}
            selected={[]}
            textField={renderTextField()}
            onSelect={noop}
          />,
        );

        async () => {
          comboBox.find(TextField).simulate('click');
          await listenerMap.keyup({keyCode: Key.DownArrow});
          expect(comboBox.state('popoverActive')).toBe(true);
        };

        async () => {
          listenerMap.keyup({keyCode: Key.Escape});
          await expect(comboBox.state('popoverActive')).toBe(false);
        };
      });
    });
  });
});

function renderTextField() {
  return <TextField label="" onChange={noop} />;
}

function renderNodeWithId() {
  return <div id="CustomNode" />;
}
