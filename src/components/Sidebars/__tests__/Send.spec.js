import React, { useEffect, useState } from 'react';
import {
  cleanup,
  waitForElement,
  fireEvent,
  act
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { renderWithMaker as render } from '../../../../test/helpers/render';
import Send from '../Send';
import lang from 'languages';
import testAccounts from '../../../../node_modules/@makerdao/test-helpers/dist/testAccounts.json';
import useMaker from '../../../hooks/useMaker';
import waitForExpect from 'wait-for-expect';

afterEach(cleanup);

test('should send 1 BAT successfully', async () => {
  let maker;
  const { getByTestId, getAllByTestId } = render(
    React.createElement(() => {
      const { maker: maker_ } = useMaker();
      maker = maker_;
      return <Send token="BAT" reset={() => null} />;
    })
  );

  const {
    addresses: [addr1, addr2]
  } = testAccounts;

  const [amountElements, addressElements, sendButton] = await Promise.all([
    waitForElement(() => getAllByTestId('send-amount-input')),
    waitForElement(() => getAllByTestId('send-address-input')),
    waitForElement(() => getByTestId('send-button'))
  ]);

  const beforeBal1 = await maker.latest('tokenBalance', addr1, 'BAT');
  const beforeBal2 = await maker.latest('tokenBalance', addr2, 'BAT');

  const amountInput = amountElements[2];
  const addressInput = addressElements[2];
  act(() => {
    fireEvent.change(amountInput, { target: { value: '1' } });
    fireEvent.change(addressInput, { target: { value: addr2 } });
  });

  expect(amountInput.value).toBe('1');
  expect(addressInput.value).toBe(addr2);

  act(() => {
    fireEvent.click(sendButton);
  });

  await waitForExpect(async () => {
    const afterBal1 = await maker.latest('tokenBalance', addr1, 'BAT');
    const afterBal2 = await maker.latest('tokenBalance', addr2, 'BAT');
    expect(
      afterBal1
        .toBigNumber()
        .minus(beforeBal1.toBigNumber())
        .toString()
    ).toEqual('-1');
    expect(
      afterBal2
        .toBigNumber()
        .minus(beforeBal2.toBigNumber())
        .toString()
    ).toEqual('1');
  });
});

test('basic rendering when sending ETH', async () => {
  const token = 'ETH';
  const { getByText } = render(<Send token={token} />);

  await waitForElement(() =>
    getByText(lang.formatString(lang.action_sidebar.send_title, token))
  );
  getByText(lang.formatString(lang.action_sidebar.send_description, token));
});

test('basic rendering when sending DAI', async () => {
  const token = 'MDAI';
  let getByText;
  act(() => {
    const { getByText: _getByText } = render(<Send token={token} />);
    getByText = _getByText;
  });

  await waitForElement(() =>
    getByText(lang.formatString(lang.action_sidebar.send_title, 'DAI'))
  );
  getByText(lang.formatString(lang.action_sidebar.send_description, 'DAI'));
});

test('basic rendering when sending WETH', async () => {
  const token = 'MWETH';
  let getByText;
  act(() => {
    const { getByText: _getByText } = render(<Send token={token} />);
    getByText = _getByText;
  });

  await waitForElement(() =>
    getByText(lang.formatString(lang.action_sidebar.send_title, 'WETH'))
  );
  getByText(lang.formatString(lang.action_sidebar.send_description, 'WETH'));
});
