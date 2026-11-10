"""Initial schema for Azure SQL Database

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-11-10 12:55:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. patients
    op.create_table(
        'patients',
        sa.Column('id', sa.String(length=32), nullable=False),
        sa.Column('name', sa.Unicode(length=100), nullable=False),
        sa.Column('age', sa.Integer(), nullable=False),
        sa.Column('gender', sa.String(length=10), nullable=False),
        sa.Column('abha_id', sa.String(length=30), nullable=False),
        sa.Column('disease', sa.String(length=50), nullable=False),
        sa.Column('discharge_date', sa.Date(), nullable=False),
        sa.Column('risk_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('compliance_rate', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('active_alerts', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('avatar_color', sa.String(length=10), nullable=False, server_default='#3B82F6'),
        sa.Column('phone', sa.String(length=20), nullable=False, server_default=''),
        sa.Column('address', sa.Unicode(length=255), nullable=False, server_default=''),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_patients_abha_id', 'patients', ['abha_id'], unique=True)
    op.create_index('ix_patients_disease', 'patients', ['disease'], unique=False)

    # 2. care_plans
    op.create_table(
        'care_plans',
        sa.Column('id', sa.String(length=32), nullable=False),
        sa.Column('patient_id', sa.String(length=32), nullable=False),
        sa.Column('disease', sa.String(length=50), nullable=False),
        sa.Column('created_date', sa.Date(), nullable=False),
        sa.Column('medications', sa.UnicodeText(), nullable=False, server_default='[]'),
        sa.Column('instructions', sa.UnicodeText(), nullable=False, server_default='[]'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['patient_id'], ['patients.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('patient_id')
    )
    op.create_index('ix_care_plans_patient_id', 'care_plans', ['patient_id'], unique=True)

    # 3. milestones
    op.create_table(
        'milestones',
        sa.Column('id', sa.String(length=32), nullable=False),
        sa.Column('care_plan_id', sa.String(length=32), nullable=False),
        sa.Column('patient_id', sa.String(length=32), nullable=False),
        sa.Column('title', sa.Unicode(length=150), nullable=False),
        sa.Column('description', sa.Unicode(length=500), nullable=False, server_default=''),
        sa.Column('due_date', sa.Date(), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='pending'),
        sa.Column('completed_date', sa.Date(), nullable=True),
        sa.ForeignKeyConstraint(['care_plan_id'], ['care_plans.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['patient_id'], ['patients.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('care_plan_id', 'id', name='pk_milestones')
    )
    op.create_index('ix_milestones_care_plan_id', 'milestones', ['care_plan_id'], unique=False)
    op.create_index('ix_milestones_patient_id', 'milestones', ['patient_id'], unique=False)

    # 4. vital_readings
    op.create_table(
        'vital_readings',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('patient_id', sa.String(length=32), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('type', sa.String(length=30), nullable=False),
        sa.Column('value', sa.Float(), nullable=False),
        sa.Column('unit', sa.String(length=20), nullable=False),
        sa.ForeignKeyConstraint(['patient_id'], ['patients.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_vital_readings_patient_id', 'vital_readings', ['patient_id'], unique=False)
    op.create_index('ix_vital_readings_timestamp', 'vital_readings', ['timestamp'], unique=False)
    op.create_index('ix_vital_readings_type', 'vital_readings', ['type'], unique=False)

    # 5. trajectory_points
    op.create_table(
        'trajectory_points',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('patient_id', sa.String(length=32), nullable=False),
        sa.Column('day', sa.Integer(), nullable=False),
        sa.Column('expected', sa.Float(), nullable=False),
        sa.Column('actual', sa.Float(), nullable=True),
        sa.Column('label', sa.Unicode(length=100), nullable=True),
        sa.ForeignKeyConstraint(['patient_id'], ['patients.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_trajectory_points_patient_id', 'trajectory_points', ['patient_id'], unique=False)
    op.create_index('ix_trajectory_patient_day', 'trajectory_points', ['patient_id', 'day'], unique=False)

    # 6. patient_interventions
    op.create_table(
        'patient_interventions',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('patient_id', sa.String(length=32), nullable=False),
        sa.Column('date', sa.String(length=30), nullable=False),
        sa.Column('type', sa.Unicode(length=100), nullable=False),
        sa.Column('description', sa.Unicode(length=500), nullable=False),
        sa.Column('outcome', sa.Unicode(length=500), nullable=False),
        sa.ForeignKeyConstraint(['patient_id'], ['patients.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_patient_interventions_patient_id', 'patient_interventions', ['patient_id'], unique=False)

    # 7. alerts
    op.create_table(
        'alerts',
        sa.Column('id', sa.String(length=32), nullable=False),
        sa.Column('patient_id', sa.String(length=32), nullable=False),
        sa.Column('patient_name', sa.Unicode(length=100), nullable=False),
        sa.Column('severity', sa.String(length=20), nullable=False),
        sa.Column('source', sa.String(length=30), nullable=False),
        sa.Column('title', sa.Unicode(length=200), nullable=False),
        sa.Column('description', sa.UnicodeText(), nullable=False),
        sa.Column('triggered_at', sa.DateTime(), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='active'),
        sa.Column('confidence', sa.Float(), nullable=False, server_default='1.0'),
        sa.Column('rule_detail', sa.UnicodeText(), nullable=True),
        sa.Column('ml_detail', sa.UnicodeText(), nullable=True),
        sa.Column('llm_detail', sa.UnicodeText(), nullable=True),
        sa.Column('deviation_score', sa.Float(), nullable=True),
        sa.Column('disease', sa.String(length=50), nullable=False),
        sa.Column('review_action', sa.String(length=20), nullable=True),
        sa.Column('review_notes', sa.UnicodeText(), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['patient_id'], ['patients.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_alerts_patient_id', 'alerts', ['patient_id'], unique=False)
    op.create_index('ix_alerts_severity', 'alerts', ['severity'], unique=False)
    op.create_index('ix_alerts_source', 'alerts', ['source'], unique=False)
    op.create_index('ix_alerts_status', 'alerts', ['status'], unique=False)
    op.create_index('ix_alerts_triggered_at', 'alerts', ['triggered_at'], unique=False)
    op.create_index('ix_alerts_disease', 'alerts', ['disease'], unique=False)

    # 8. pipeline_runs
    op.create_table(
        'pipeline_runs',
        sa.Column('id', sa.String(length=32), nullable=False),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('triggered_at', sa.DateTime(), nullable=False),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('triggered_by', sa.Unicode(length=100), nullable=False),
        sa.Column('patients_processed', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('alerts_generated', sa.Integer(), nullable=False, server_default='0'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_pipeline_runs_triggered_at', 'pipeline_runs', ['triggered_at'], unique=False)
    op.create_index('ix_pipeline_runs_status', 'pipeline_runs', ['status'], unique=False)

    # 9. pipeline_nodes
    op.create_table(
        'pipeline_nodes',
        sa.Column('id', sa.String(length=32), nullable=False),
        sa.Column('run_id', sa.String(length=32), nullable=False),
        sa.Column('name', sa.Unicode(length=100), nullable=False),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('started_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('input_summary', sa.UnicodeText(), nullable=True),
        sa.Column('output_summary', sa.UnicodeText(), nullable=True),
        sa.Column('duration_ms', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['run_id'], ['pipeline_runs.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('run_id', 'id', name='pk_pipeline_nodes')
    )
    op.create_index('ix_pipeline_nodes_run_id', 'pipeline_nodes', ['run_id'], unique=False)


def downgrade() -> None:
    op.drop_table('pipeline_nodes')
    op.drop_table('pipeline_runs')
    op.drop_table('alerts')
    op.drop_table('patient_interventions')
    op.drop_table('trajectory_points')
    op.drop_table('vital_readings')
    op.drop_table('milestones')
    op.drop_table('care_plans')
    op.drop_table('patients')
