import * as React from 'react';

import {translate, createPolarisContext} from '../utils';
import {
  PrimitiveReplacementDictionary,
  ComplexReplacementDictionary,
} from '../types';

import Intl from '../Intl';
import Link from '../Link';
import StickyManager from '../StickyManager';

describe('translate()', () => {
  it('returns a simple string value in the translation dictionary', () => {
    expect(translate('foo', {foo: 'bar'})).toBe('bar');
  });

  it('returns a nested string value in the translation dictionary', () => {
    expect(translate('foo.bar.baz', {foo: {bar: {baz: 'qux'}}})).toBe('qux');
  });

  it('returns an empty string when no match is found', () => {
    expect(translate('foo.bar.baz', {foo: {bar: 'baz'}})).toBe('');
  });

  describe('replacements', () => {
    function translateWithReplacements(
      id: string,
      replacements:
        | PrimitiveReplacementDictionary
        | ComplexReplacementDictionary,
    ) {
      return translate('value', {value: id}, replacements);
    }

    it('uses replacements', () => {
      expect(translateWithReplacements('foo {next}', {next: 'bar'})).toBe(
        'foo bar',
      );
    });

    it('throws an error for a missing replacement', () => {
      expect(() =>
        translateWithReplacements('foo {next}', {notNext: 'bar'}),
      ).toThrow();
    });
  });
});

describe('createPolarisContext()', () => {
  it('returns the right context without properties', () => {
    const context = createPolarisContext();
    const mockContext = {
      polaris: {
        intl: new Intl(undefined),
        link: new Link(),
        stickyManager: new StickyManager(),
      },
      easdk: undefined,
    };

    expect(context).toEqual(mockContext);
  });

  it('returns the right context with properties', () => {
    const i18n = {
      Polaris: {
        Common: {
          undo: 'Custom Undo',
        },
      },
    };
    const CustomLinkComponent = () => {
      return <a href="test">Custom Link Component</a>;
    };
    const stickyManager = new StickyManager();
    const context = createPolarisContext({
      i18n,
      linkComponent: CustomLinkComponent,
      stickyManager,
    });
    const mockContext = {
      polaris: {
        intl: new Intl(i18n),
        link: new Link(CustomLinkComponent),
        stickyManager,
      },
    };

    expect(context).toEqual(mockContext);
  });
});
