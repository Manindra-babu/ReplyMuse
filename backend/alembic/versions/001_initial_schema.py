"""Initial database schema for ReplyMuse

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-10-27 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from app.database import GUID

# revision identifiers, used by Alembic.
revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Users
    op.create_table(
        'users',
        sa.Column('id', GUID(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('email_verified_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('reset_token', sa.String(length=255), nullable=True),
        sa.Column('reset_token_expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_reset_token'), 'users', ['reset_token'], unique=False)

    # 2. Business Profiles
    op.create_table(
        'business_profiles',
        sa.Column('id', GUID(), nullable=False),
        sa.Column('user_id', GUID(), nullable=False),
        sa.Column('business_name', sa.String(length=255), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('contact_email', sa.String(length=255), nullable=True),
        sa.Column('contact_phone', sa.String(length=50), nullable=True),
        sa.Column('default_language', sa.String(length=20), nullable=False, server_default='en'),
        sa.Column('preferred_greeting', sa.String(length=100), nullable=True),
        sa.Column('preferred_sign_off', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_business_profiles_id'), 'business_profiles', ['id'], unique=False)
    op.create_index(op.f('ix_business_profiles_user_id'), 'business_profiles', ['user_id'], unique=True)

    # 3. Voice Profiles
    op.create_table(
        'voice_profiles',
        sa.Column('id', GUID(), nullable=False),
        sa.Column('business_id', GUID(), nullable=False),
        sa.Column('tone', sa.String(length=255), nullable=False),
        sa.Column('formality', sa.String(length=100), nullable=False),
        sa.Column('preferred_length', sa.String(length=100), nullable=False),
        sa.Column('greeting', sa.String(length=100), nullable=True),
        sa.Column('sign_off', sa.String(length=100), nullable=True),
        sa.Column('preferred_phrases', sa.JSON(), nullable=False),
        sa.Column('avoided_phrases', sa.JSON(), nullable=False),
        sa.Column('first_person_style', sa.String(length=50), nullable=False, server_default='we'),
        sa.Column('language_preference', sa.String(length=50), nullable=False, server_default='en'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['business_id'], ['business_profiles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_voice_profiles_business_id'), 'voice_profiles', ['business_id'], unique=True)
    op.create_index(op.f('ix_voice_profiles_id'), 'voice_profiles', ['id'], unique=False)

    # 4. Voice Examples
    op.create_table(
        'voice_examples',
        sa.Column('id', GUID(), nullable=False),
        sa.Column('business_id', GUID(), nullable=False),
        sa.Column('example_text', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['business_id'], ['business_profiles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_voice_examples_business_id'), 'voice_examples', ['business_id'], unique=False)
    op.create_index(op.f('ix_voice_examples_id'), 'voice_examples', ['id'], unique=False)

    # 5. Reviews
    op.create_table(
        'reviews',
        sa.Column('id', GUID(), nullable=False),
        sa.Column('business_id', GUID(), nullable=False),
        sa.Column('review_text', sa.Text(), nullable=False),
        sa.Column('reviewer_name', sa.String(length=255), nullable=True),
        sa.Column('star_rating', sa.Integer(), nullable=True),
        sa.Column('response_language', sa.String(length=50), nullable=True),
        sa.Column('detected_sentiment', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['business_id'], ['business_profiles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_reviews_business_id'), 'reviews', ['business_id'], unique=False)
    op.create_index(op.f('ix_reviews_created_at'), 'reviews', ['created_at'], unique=False)
    op.create_index(op.f('ix_reviews_id'), 'reviews', ['id'], unique=False)

    # 6. Reply Drafts
    op.create_table(
        'reply_drafts',
        sa.Column('id', GUID(), nullable=False),
        sa.Column('review_id', GUID(), nullable=False),
        sa.Column('model_provider', sa.String(length=50), nullable=False),
        sa.Column('model_name', sa.String(length=100), nullable=False),
        sa.Column('original_draft', sa.Text(), nullable=False),
        sa.Column('edited_reply', sa.Text(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='draft'),
        sa.Column('safety_flags', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['review_id'], ['reviews.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_reply_drafts_created_at'), 'reply_drafts', ['created_at'], unique=False)
    op.create_index(op.f('ix_reply_drafts_id'), 'reply_drafts', ['id'], unique=False)
    op.create_index(op.f('ix_reply_drafts_review_id'), 'reply_drafts', ['review_id'], unique=False)

    # 7. Usage Events
    op.create_table(
        'usage_events',
        sa.Column('id', GUID(), nullable=False),
        sa.Column('user_id', GUID(), nullable=False),
        sa.Column('event_type', sa.String(length=50), nullable=False, server_default='generation'),
        sa.Column('quantity', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('idempotency_key', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_usage_events_created_at'), 'usage_events', ['created_at'], unique=False)
    op.create_index(op.f('ix_usage_events_id'), 'usage_events', ['id'], unique=False)
    op.create_index(op.f('ix_usage_events_idempotency_key'), 'usage_events', ['idempotency_key'], unique=True)
    op.create_index(op.f('ix_usage_events_user_id'), 'usage_events', ['user_id'], unique=False)

    # 8. Subscriptions
    op.create_table(
        'subscriptions',
        sa.Column('id', GUID(), nullable=False),
        sa.Column('user_id', GUID(), nullable=False),
        sa.Column('plan', sa.String(length=50), nullable=False, server_default='free'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='active'),
        sa.Column('provider_customer_id', sa.String(length=255), nullable=True),
        sa.Column('period_start', sa.DateTime(timezone=True), nullable=False),
        sa.Column('period_end', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_subscriptions_id'), 'subscriptions', ['id'], unique=False)
    op.create_index(op.f('ix_subscriptions_user_id'), 'subscriptions', ['user_id'], unique=True)


def downgrade() -> None:
    op.drop_table('subscriptions')
    op.drop_table('usage_events')
    op.drop_table('reply_drafts')
    op.drop_table('reviews')
    op.drop_table('voice_examples')
    op.drop_table('voice_profiles')
    op.drop_table('business_profiles')
    op.drop_table('users')
