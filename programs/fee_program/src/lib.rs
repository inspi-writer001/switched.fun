use anchor_lang::prelude::*;
use anchor_spl::token::{self, TokenAccount, Token, Transfer};

declare_id!("");

#[program]
pub mod fee_program {
    use super::*;

    /// Transfers `amount` of SPL tokens from `from` ⇒ `to`, taking 2% to `fee_account`.
    pub fn transfer_with_fee(
        ctx: Context<TransferWithFee>,
        amount: u64,
    ) -> Result<()> {
        // Calculate 2% fee (integer division; any remainder stays in user wallet)
        let fee_amount = amount.checked_mul(2).unwrap()
                              .checked_div(100).unwrap();
        let net_amount = amount.checked_sub(fee_amount).unwrap();

        // Transfer the fee first
        let cpi_accounts_fee = Transfer {
            from: ctx.accounts.from_token.to_account_info(),
            to: ctx.accounts.fee_token.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        token::transfer(
            CpiContext::new(cpi_program.clone(), cpi_accounts_fee),
            fee_amount,
        )?;

        // Transfer the remainder to the recipient
        let cpi_accounts_net = Transfer {
            from: ctx.accounts.from_token.to_account_info(),
            to: ctx.accounts.to_token.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        token::transfer(
            CpiContext::new(cpi_program, cpi_accounts_net),
            net_amount,
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct TransferWithFee<'info> {
    /// The wallet signing and paying for the tokens
    #[account(mut)]
    pub authority: Signer<'info>,

    /// Token account of authority (source)
    #[account(mut)]
    pub from_token: Account<'info, TokenAccount>,

    /// Recipient’s token account
    #[account(mut)]
    pub to_token: Account<'info, TokenAccount>,

    /// Fee collector’s token account
    #[account(mut)]
    pub fee_token: Account<'info, TokenAccount>,

    /// The SPL Token program
    pub token_program: Program<'info, Token>,
}
