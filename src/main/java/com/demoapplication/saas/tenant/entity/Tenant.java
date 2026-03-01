package com.demoapplication.saas.tenant.entity;

import com.demoapplication.saas.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "tenants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Tenant extends BaseEntity {

    @Column(name = "name", nullable = false)
    private String name;
}
