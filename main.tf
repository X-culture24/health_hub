terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
  required_version = ">= 1.3.0"
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  default = "us-east-1"
}

# Example: PostgreSQL RDS instance
resource "aws_db_instance" "healthhub" {
  allocated_storage    = 20
  engine               = "postgres"
  engine_version       = "15.4"
  instance_class       = "db.t3.micro"
  name                 = "healthdb"
  username             = "healthuser"
  password             = "healthpass"
  parameter_group_name = "default.postgres15"
  skip_final_snapshot  = true
}

# Example: ECS Fargate cluster (for containers)
resource "aws_ecs_cluster" "main" {
  name = "healthhub-cluster"
}

# ...
# You would add ECS task definitions, services, ALB, security groups, etc. here
# This is a starting point for infrastructure-as-code 